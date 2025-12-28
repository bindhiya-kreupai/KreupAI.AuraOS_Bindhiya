export const PayrollSettingsService = {
  getSettings: async () => {
    return {
      general: {
        cycle: 'Monthly',
        startDay: 1,
        payDay: 'Last Working Day',
        currency: 'INR (₹)'
      },
      payslip: [],
      layout: 'Modern'
    };
  }
};
