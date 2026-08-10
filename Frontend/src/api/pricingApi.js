import api from './axiosConfig';

export const pricingApi = {
  addPricingRule: async (turfId, ruleDto) => {
    const response = await api.post(`/api/pricing-rules/${turfId}`, ruleDto);
    return response.data;
  },

  getPricingRulesByTurf: async (turfId) => {
    const response = await api.get(`/api/pricing-rules/turf/${turfId}`);
    return response.data;
  },

  getPricingRuleById: async (pricingRuleId) => {
    const response = await api.get(`/api/pricing-rules/${pricingRuleId}`);
    return response.data;
  },

  updatePricingRule: async (pricingRuleId, ruleDto) => {
    const response = await api.put(`/api/pricing-rules/${pricingRuleId}`, ruleDto);
    return response.data;
  },

  togglePricingRuleStatus: async (pricingRuleId, active) => {
    const response = await api.patch(`/api/pricing-rules/${pricingRuleId}/status?active=${active}`);
    return response.data;
  },

  deletePricingRule: async (pricingRuleId) => {
    const response = await api.delete(`/api/pricing-rules/${pricingRuleId}`);
    return response.data;
  },

  resetAllPricingRules: async (turfId) => {
    const response = await api.delete(`/api/pricing-rules/turf/${turfId}/reset`);
    return response.data;
  },
};
