
export interface DailyEntry {
  id: string;
  date: string;
  time: string;
  storeName: string;
  grossAmount: number;
  fuel: number;        
  food: number;        
  maintenance: number; 
  netAmount: number;   
  kmDriven?: number;
  fuelPrice?: number;
  kmAtMaintenance?: number; // KM no momento da manutenção
}

export interface WeeklySummary {
  totalGross: number;
  totalNet: number;
  totalFuel: number;
  totalFood: number;
  totalMaintenance: number;
  totalSpentFuel: number;
  totalSpentFood: number;
  totalSpentMaintenance: number;
  totalFees: number;
  totalKm?: number;
}

export interface MaintenanceAlert {
  id: string;
  description: string;
  kmInterval: number;
  lastKm: number;
}

export interface AppConfig {
  percFuel: number;
  percFood: number;
  percMaintenance: number;
  dailyGoal: number; 
  lastFuelPrice?: number;
  maintenanceAlerts?: MaintenanceAlert[];
}

export const DEFAULT_CONFIG: AppConfig = {
  percFuel: 0.14,      // 14%
  percFood: 0.08,      // 8%
  percMaintenance: 0.08, // 8%
  dailyGoal: 250,       // Meta padrão de R$ 250
  lastFuelPrice: 5.50,   // Valor base sugerido
  maintenanceAlerts: [
    { id: '1', description: 'Troca de Óleo', kmInterval: 10000, lastKm: 0 },
    { id: '2', description: 'Pneus', kmInterval: 40000, lastKm: 0 },
    { id: '3', description: 'Freios', kmInterval: 20000, lastKm: 0 }
  ]
};

export const CONSTANTS = {
  REF_FUEL_DAILY: 35,
  REF_FOOD_DAILY: 20,
  REF_MAINTENANCE_DAILY: 20
};
