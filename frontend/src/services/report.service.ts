import { mockDB } from './mockStore'

export const reportService = {
  sales: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsSales(from_date, to_date);
  },
  purchases: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsPurchases(from_date, to_date);
  },
  stock: async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsStock();
  },
  gst: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsGst(from_date, to_date);
  },
  profitLoss: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsProfitLoss(from_date, to_date);
  },
  creditors: async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return (mockDB as any).getReportsCreditors();
  },
  debtors: async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return (mockDB as any).getReportsDebtors();
  },
  vehicleExpenses: async (from_date?: string, to_date?: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    const raw = (mockDB as any).getReportsVehicleExpenses();
    if (!from_date || !to_date) return raw;
    
    const fromTime = new Date(from_date).getTime();
    const toTime = new Date(to_date).getTime() + 24 * 60 * 60 * 1000 - 1;
    
    const filteredItems = raw.all_items.filter((e: any) => {
      const t = new Date(e.expense_date).getTime();
      return t >= fromTime && t <= toTime;
    });
    
    let total_expenses = 0;
    let total_fuel = 0;
    let total_maintenance = 0;
    let total_others = 0;
    const vehicleWiseMap: Record<string, any> = {};
    
    filteredItems.forEach((e: any) => {
      const amt = Number(e.amount) || 0;
      total_expenses += amt;
      if (e.expense_type === 'fuel') total_fuel += amt;
      else if (e.expense_type === 'maintenance') total_maintenance += amt;
      else total_others += amt;
      
      const vNo = e.vehicle_no || 'Unknown Vehicle';
      if (!vehicleWiseMap[vNo]) {
        vehicleWiseMap[vNo] = { vehicle_no: vNo, amount: 0, fuel_amount: 0, maint_amount: 0, other_amount: 0 };
      }
      vehicleWiseMap[vNo].amount += amt;
      if (e.expense_type === 'fuel') vehicleWiseMap[vNo].fuel_amount += amt;
      else if (e.expense_type === 'maintenance') vehicleWiseMap[vNo].maint_amount += amt;
      else vehicleWiseMap[vNo].other_amount += amt;
    });
    
    return {
      total_expenses,
      total_fuel,
      total_maintenance,
      total_others,
      vehicle_wise: Object.values(vehicleWiseMap),
      all_items: filteredItems
    };
  },
  dailyWages: async (from_date?: string, to_date?: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    const raw = (mockDB as any).getReportsDailyWages();
    if (!from_date || !to_date) return raw;
    
    const fromTime = new Date(from_date).getTime();
    const toTime = new Date(to_date).getTime() + 24 * 60 * 60 * 1000 - 1;
    
    const filteredItems = raw.all_items.filter((s: any) => {
      const t = new Date(s.payment_date).getTime();
      return t >= fromTime && t <= toTime;
    });
    
    let total_daily_wages = 0;
    const staffWiseMap: Record<number, any> = {};
    
    filteredItems.forEach((s: any) => {
      const amt = Number(s.amount) || 0;
      total_daily_wages += amt;
      
      const sId = s.staff_id;
      if (!staffWiseMap[sId]) {
        staffWiseMap[sId] = { staff_id: sId, staff_name: s.staff_name, total_paid: 0, payments_count: 0 };
      }
      staffWiseMap[sId].total_paid += amt;
      staffWiseMap[sId].payments_count += 1;
    });
    
    return {
      total_daily_wages,
      staff_wise: Object.values(staffWiseMap),
      all_items: filteredItems
    };
  },
  monthlySalaries: async (from_date?: string, to_date?: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    const raw = (mockDB as any).getReportsMonthlySalaries();
    if (!from_date || !to_date) return raw;
    
    const fromTime = new Date(from_date).getTime();
    const toTime = new Date(to_date).getTime() + 24 * 60 * 60 * 1000 - 1;
    
    const filteredItems = raw.all_items.filter((s: any) => {
      const t = new Date(s.payment_date).getTime();
      return t >= fromTime && t <= toTime;
    });
    
    let total_monthly_salaries = 0;
    const staffWiseMap: Record<number, any> = {};
    
    filteredItems.forEach((s: any) => {
      const amt = Number(s.amount) || 0;
      total_monthly_salaries += amt;
      
      const sId = s.staff_id;
      if (!staffWiseMap[sId]) {
        staffWiseMap[sId] = { staff_id: sId, staff_name: s.staff_name, total_paid: 0, payments_count: 0 };
      }
      staffWiseMap[sId].total_paid += amt;
      staffWiseMap[sId].payments_count += 1;
    });
    
    return {
      total_monthly_salaries,
      staff_wise: Object.values(staffWiseMap),
      all_items: filteredItems
    };
  },
}
