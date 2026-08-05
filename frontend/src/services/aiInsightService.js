import api, { realtimeBus } from './api';

let insights = [
  { id: 1, type: 'CRITICAL_RISK', title: 'Concrete Curing Delay Predicted', confidence: '94%', description: 'Humidity drop in Zone B may extend curing time by 18 hours. Recommendation: Apply misting spray.', impact: 'High' },
  { id: 2, type: 'SAFETY_HAZARD', title: 'PPE Non-Compliance Alert', confidence: '89%', description: 'CCTV AI detected 3 workers without hard hats near Tower A hoist zone.', impact: 'Critical' },
  { id: 3, type: 'COST_OPTIMIZATION', title: 'Rebar Material Surplus Detected', confidence: '91%', description: 'Zone C rebar consumption is 12% lower than estimated. 4 tons available for reallocation.', impact: 'Medium' },
];

export const aiInsightService = {
  async getInsights() {
    try {
      const res = await api.get('/ai-insights');
      return res.data?.data || insights;
    } catch {
      return insights;
    }
  },

  async runAnalysis() {
    const newInsight = {
      id: Date.now(),
      type: 'PREDICTIVE_MAINTENANCE',
      title: 'Excavator EX-200 Hydraulics Telemetry Anomaly',
      confidence: '96%',
      description: 'Vibration frequency anomaly detected. Recommended fluid inspection before next shift.',
      impact: 'Medium',
    };
    insights = [newInsight, ...insights];
    realtimeBus.emit('AI_INSIGHT_UPDATE', insights);
    return insights;
  },

  subscribeToInsights(callback) {
    callback(insights);
    return realtimeBus.subscribe('AI_INSIGHT_UPDATE', callback);
  },
};

export default aiInsightService;
