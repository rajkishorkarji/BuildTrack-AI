import api, { realtimeBus } from './api';

let equipmentList = [
  { id: 1, name: 'Tower Crane TC-500', category: 'Lifting', status: 'ACTIVE', location: 'Zone A', health: '98%', hours: 1420 },
  { id: 2, name: 'Concrete Pump 5000', category: 'Pouring', status: 'MAINTENANCE', location: 'Zone B', health: '74%', hours: 890 },
  { id: 3, name: 'Hydraulic Excavator EX-200', category: 'Excavation', status: 'ACTIVE', location: 'Zone C', health: '92%', hours: 2100 },
  { id: 4, name: 'Wheel Loader WL-30', category: 'Earthmoving', status: 'IDLE', location: 'Zone D', health: '88%', hours: 650 },
];

export const equipmentService = {
  async getEquipment() {
    try {
      const res = await api.get('/equipment');
      return res.data?.data || equipmentList;
    } catch {
      return equipmentList;
    }
  },

  async updateEquipmentStatus(id, status) {
    equipmentList = equipmentList.map((eq) => (eq.id === id ? { ...eq, status } : eq));
    realtimeBus.emit('EQUIPMENT_UPDATE', equipmentList);
    return equipmentList;
  },

  subscribeToEquipment(callback) {
    callback(equipmentList);
    return realtimeBus.subscribe('EQUIPMENT_UPDATE', callback);
  },
};

export default equipmentService;
