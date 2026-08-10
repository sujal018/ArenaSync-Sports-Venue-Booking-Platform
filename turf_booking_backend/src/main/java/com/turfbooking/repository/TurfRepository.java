package com.turfbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.Turf;
import com.turfbooking.enums.SportType;
import com.turfbooking.enums.TurfStatus;

public interface TurfRepository extends JpaRepository<Turf, Long> {

	boolean existsByTurfNameAndOwnerId(String name, Long ownerId);

	// Duplicate location check fors same owner
	boolean existsByOwnerIdAndAddressIgnoreCaseAndCityIgnoreCaseAndStateIgnoreCase(Long ownerId, String address,
			String city, String state);

	// Get all turfs of an owner
	List<Turf> findByOwnerId(Long ownerId);

	// Search by city
	List<Turf> findByCityIgnoreCase(String city);

	// Search by sport
	List<Turf> findBySportType(SportType sportType);

	// Search by city and sport
	List<Turf> findByCityIgnoreCaseAndSportType(String city, SportType sportType);

	// Active turfs
	List<Turf> findByStatus(TurfStatus status);
	
	long count();

	long countByStatus(TurfStatus status);
}
