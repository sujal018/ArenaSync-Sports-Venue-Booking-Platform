package com.turfbooking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.turfbooking.dto.slot.SlotResponseDto;
import com.turfbooking.entity.Slot;
import com.turfbooking.entity.Turf;
import com.turfbooking.enums.SlotStatus;
import com.turfbooking.exception.ResourceAlreadyExistsException;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.SlotRepository;
import com.turfbooking.repository.TurfRepository;
import com.turfbooking.service.SlotService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final TurfRepository turfRepository;
    private final ModelMapper modelMapper;
    private final PricingRuleService pricingRuleService;

    @Override
    public String generateSlots(Long turfId, LocalDate slotDate) {

        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Turf not found with id: " + turfId));

        // Prevent duplicate generation
        if (!slotRepository.findByTurfIdAndSlotDateOrderByStartTimeAsc(turfId, slotDate).isEmpty()) {
            throw new ResourceAlreadyExistsException(
                    "Slots already generated for " + slotDate);
        }

        LocalTime startTime = turf.getOpeningTime();
        LocalTime closingTime = turf.getClosingTime();
        Integer slotDuration = turf.getSlotDuration();

        // Validation
        if (startTime == null || closingTime == null || slotDuration == null) {
            throw new IllegalArgumentException("Opening time, closing time and slot duration must not be null.");
        }

        if (slotDuration <= 0) {
            throw new IllegalArgumentException("Slot duration must be greater than 0.");
        }

        if (!startTime.isBefore(closingTime)) {
            throw new IllegalArgumentException("Opening time must be before closing time.");
        }

      
        List<Slot> slots = new ArrayList<>();

        int startMinutes = startTime.toSecondOfDay() / 60;
        int closingMinutes = closingTime.toSecondOfDay() / 60;

        while (startMinutes + slotDuration <= closingMinutes) {

            int endMinutes = startMinutes + slotDuration;

            LocalTime slotStart = LocalTime.of(startMinutes / 60, startMinutes % 60);
            LocalTime slotEnd = LocalTime.of(endMinutes / 60, endMinutes % 60);

            Slot slot = Slot.builder()
                    .slotDate(slotDate)
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .status(SlotStatus.AVAILABLE)
                    .turf(turf)
                    .build();

            slots.add(slot);

            // Move to next slot
            startMinutes = endMinutes;
        }

        slotRepository.saveAll(slots);

        return slots.size() + " slots generated successfully.";
    }

    @Override
    public List<SlotResponseDto> getSlotsByTurf(Long turfId, LocalDate slotDate) {

        List<Slot> slots = slotRepository
                .findByTurfIdAndSlotDateOrderByStartTimeAsc(turfId, slotDate);

        if (slots.isEmpty()) {
            throw new ResourceNotFoundException("No slots found");
        }

        return slots.stream().map(slot -> {
            SlotResponseDto dto = modelMapper.map(slot, SlotResponseDto.class);
            dto.setTurfId(slot.getTurf().getId());
            dto.setTurfName(slot.getTurf().getTurfName());
            // 2. ADDED DYNAMIC PRICE CALCULATION
            Double dynamicPrice = pricingRuleService.calculateSlotPrice(turfId, slot.getSlotDate(), slot.getStartTime());
            dto.setPrice(dynamicPrice);
            return dto;
        }).toList();
           
    }

    @Override
    public List<SlotResponseDto> getAvailableSlots(Long turfId, LocalDate slotDate) {

        List<Slot> slots = slotRepository
                .findByTurfIdAndSlotDateAndStatusOrderByStartTimeAsc(
                        turfId,
                        slotDate,
                        SlotStatus.AVAILABLE);

        return slots.stream().map(slot -> {
            SlotResponseDto dto = modelMapper.map(slot, SlotResponseDto.class);
            dto.setTurfId(slot.getTurf().getId());
            dto.setTurfName(slot.getTurf().getTurfName());
            Double dynamicPrice = pricingRuleService.calculateSlotPrice(turfId, slot.getSlotDate(), slot.getStartTime());
            dto.setPrice(dynamicPrice);
            return dto;
        }).toList();
    }

    @Override
    public String updateSlotStatus(Long slotId, String status) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Slot not found with id: " + slotId));

        slot.setStatus(SlotStatus.valueOf(status.toUpperCase()));

        slotRepository.save(slot);

        return "Slot status updated successfully";
    }

    @Override
    public String deleteSlots(Long turfId, LocalDate slotDate) {

        List<Slot> slots = slotRepository
                .findByTurfIdAndSlotDateOrderByStartTimeAsc(turfId, slotDate);

        if (slots.isEmpty()) {
            throw new ResourceNotFoundException("No slots found for the given date");
        }

        slotRepository.deleteAll(slots);

        return "Slots deleted successfully";
    }
}