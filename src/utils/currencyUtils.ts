// Currency utility functions
export const formatCurrency = (amount: number, currency: string = 'SAR', language: string = 'ar'): string => {
  const currencySymbols: { [key: string]: string } = {
    'SAR': 'ر.س',
    'USD': '$',
    'EUR': '€',
    'AED': 'د.إ',
    'GBP': '£',
    'KWD': 'د.ك',
    'QAR': 'ر.ق',
    'BHD': 'د.ب',
    'OMR': 'ر.ع',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Format the number with commas
  const formattedAmount = amount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Return the formatted currency string based on language
  if (language === 'ar') {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol} ${formattedAmount}`;
  }
};

// Convert amount from one currency to another
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, exchangeRates: { [key: string]: number }): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // If we have direct exchange rate
  if (exchangeRates[`${fromCurrency}_${toCurrency}`]) {
    return amount * exchangeRates[`${fromCurrency}_${toCurrency}`];
  }
  
  // Convert to USD first (assuming USD is the base currency for exchange rates)
  const toUSD = fromCurrency === 'USD' ? amount : amount / exchangeRates[`USD_${fromCurrency}`];
  
  // Convert from USD to target currency
  return toCurrency === 'USD' ? toUSD : toUSD * exchangeRates[`USD_${toCurrency}`];
};

// Get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'SAR': 'ر.س',
    'USD': '$',
    'EUR': '€',
    'AED': 'د.إ',
    'GBP': '£',
    'KWD': 'د.ك',
    'QAR': 'ر.ق',
    'BHD': 'د.ب',
    'OMR': 'ر.ع',
  };
  
  return currencySymbols[currency] || currency;
};

// Get currency name
export const getCurrencyName = (currency: string, language: string = 'ar'): string => {
  const currencyNames: { [key: string]: { ar: string, en: string } } = {
    'SAR': { ar: 'ريال سعودي', en: 'Saudi Riyal' },
    'USD': { ar: 'دولار أمريكي', en: 'US Dollar' },
    'EUR': { ar: 'يورو', en: 'Euro' },
    'AED': { ar: 'درهم إماراتي', en: 'UAE Dirham' },
    'GBP': { ar: 'جنيه إسترليني', en: 'British Pound' },
    'KWD': { ar: 'دينار كويتي', en: 'Kuwaiti Dinar' },
    'QAR': { ar: 'ريال قطري', en: 'Qatari Riyal' },
    'BHD': { ar: 'دينار بحريني', en: 'Bahraini Dinar' },
    'OMR': { ar: 'ريال عماني', en: 'Omani Rial' },
  };
  
  return currencyNames[currency] ? currencyNames[currency][language as 'ar' | 'en'] : currency;
};

// Get currency decimal places
export const getCurrencyDecimalPlaces = (currency: string): number => {
  const decimalPlaces: { [key: string]: number } = {
    'SAR': 2,
    'USD': 2,
    'EUR': 2,
    'AED': 2,
    'GBP': 2,
    'KWD': 3, // Kuwaiti Dinar uses 3 decimal places
    'QAR': 2,
    'BHD': 3, // Bahraini Dinar uses 3 decimal places
    'OMR': 3, // Omani Rial uses 3 decimal places
  };
  
  return decimalPlaces[currency] || 2;
};

// Format number based on locale
export const formatNumber = (number: number, language: string = 'ar', decimalPlaces: number = 2): string => {
  return number.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
};

// Convert number to words (for invoice printing)
export const numberToWords = (number: number, currency: string = 'SAR', language: string = 'ar'): string => {
  // This is a placeholder - in a real implementation, you would use a library like js-money or write a full implementation
  // For Arabic, you would need specialized logic for the Arabic grammar rules
  
  if (language === 'ar') {
    // Placeholder for Arabic number to words conversion
    return `${number} ${getCurrencyName(currency, 'ar')}`;
  } else {
    // Placeholder for English number to words conversion
    return `${number} ${getCurrencyName(currency, 'en')}`;
  }
};