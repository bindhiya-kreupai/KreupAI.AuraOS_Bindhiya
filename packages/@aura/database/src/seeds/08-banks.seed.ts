/**
 * @module BanksSeed
 * @description Seed data for Banks in GCC and India
 * @project AURA HCM Platform
 */

// Interface based on usage in Banks module
export const banksSeed = [
    // UAE Banks
    {
        code: 'FAB',
        name: 'First Abu Dhabi Bank',
        swiftCode: 'NBADAEADS',
        countryCode: 'AE',
        isActive: true,
    },
    {
        code: 'ENBD',
        name: 'Emirates NBD',
        swiftCode: 'EBIBAEADS',
        countryCode: 'AE',
        isActive: true,
    },
    {
        code: 'ADCB',
        name: 'Abu Dhabi Commercial Bank',
        swiftCode: 'ADCBADS',
        countryCode: 'AE',
        isActive: true,
    },

    // Saudi Banks
    {
        code: 'RJHI',
        name: 'Al Rajhi Bank',
        swiftCode: 'RJHIKJSA',
        countryCode: 'SA',
        isActive: true,
    },
    {
        code: 'SNB',
        name: 'Saudi National Bank',
        swiftCode: 'NCBKJSA',
        countryCode: 'SA',
        isActive: true,
    },

    // India Banks
    {
        code: 'SBI',
        name: 'State Bank of India',
        swiftCode: 'SBININBB',
        countryCode: 'IN',
        isActive: true,
    },
    {
        code: 'HDFC',
        name: 'HDFC Bank',
        swiftCode: 'HDFCCINBB',
        countryCode: 'IN',
        isActive: true,
    },
    {
        code: 'ICICI',
        name: 'ICICI Bank',
        swiftCode: 'ICICINBB',
        countryCode: 'IN',
        isActive: true,
    },

    // Bahrain Banks
    {
        code: 'NBB',
        name: 'National Bank of Bahrain',
        swiftCode: 'NBBNBM',
        countryCode: 'BH',
        isActive: true,
    },

    // Qatar Banks
    {
        code: 'QNB',
        name: 'Qatar National Bank',
        swiftCode: 'QNBAQAQA',
        countryCode: 'QA',
        isActive: true,
    },

    // Oman Banks
    {
        code: 'BM',
        name: 'Bank Muscat',
        swiftCode: 'BMUSOM',
        countryCode: 'OM',
        isActive: true,
    },

    // International
    {
        code: 'HSBC',
        name: 'HSBC',
        swiftCode: 'HSBC',
        countryCode: 'GB', // Defaulting to HQ or generic
        isActive: true,
    },
    {
        code: 'SCB',
        name: 'Standard Chartered Bank',
        swiftCode: 'SCBL',
        countryCode: 'GB',
        isActive: true,
    }
];
