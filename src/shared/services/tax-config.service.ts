/**
 * Tax Configuration Service
 * Centralized service for loading and managing dynamic tax configuration
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
import { TaxConfiguration } from '../types';

// Default fallback configuration matching TaxConfiguration interface
const DEFAULT_TAX_CONFIG: TaxConfiguration = {
  payeBrackets: [
    { min: 0, max: 60000, rate: 0 },
    { min: 60001, max: 100000, rate: 10 },
    { min: 100001, max: 200000, rate: 20 },
    { min: 200001, max: null, rate: 30 },
  ],
  pensionRates: { employee: 6, employer: 8 },
  maternityRates: { employee: 0.3, employer: 0.3 },
  cbhiRates: { employee: 0.5, employer: 0 },
  ramaRates: { employee: 7.5, employer: 7.5 },
  effectiveDate: new Date().toISOString(),
};

/**
 * Load tax configuration from database
 * Falls back to default configuration if database config is not available
 */
export async function loadTaxConfiguration(): Promise<TaxConfiguration> {
  try {
    const docRef = doc(db, 'app_settings', 'tax_brackets');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Transform database format to TaxConfiguration interface format
      const taxConfig: TaxConfiguration = {
        payeBrackets: data.paye_brackets?.map((bracket: Record<string, unknown>) => ({
          min: bracket.min,
          max: bracket.max,
          rate: bracket.rate
        })) || DEFAULT_TAX_CONFIG.payeBrackets,
        pensionRates: {
          employee: data.pension_rates?.employee || DEFAULT_TAX_CONFIG.pensionRates.employee,
          employer: data.pension_rates?.employer || DEFAULT_TAX_CONFIG.pensionRates.employer
        },
        maternityRates: {
          employee: data.maternity_rates?.employee || DEFAULT_TAX_CONFIG.maternityRates.employee,
          employer: data.maternity_rates?.employer || DEFAULT_TAX_CONFIG.maternityRates.employer
        },
        cbhiRates: {
          employee: data.cbhi_rates?.employee || DEFAULT_TAX_CONFIG.cbhiRates.employee,
          employer: data.cbhi_rates?.employer || DEFAULT_TAX_CONFIG.cbhiRates.employer
        },
        ramaRates: {
          employee: data.rama_rates?.employee || DEFAULT_TAX_CONFIG.ramaRates.employee,
          employer: data.rama_rates?.employer || DEFAULT_TAX_CONFIG.ramaRates.employer
        },
        effectiveDate: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString()
      };
      
      return taxConfig;
    } else {
      console.warn('Tax configuration not found in database, using default values');
      return DEFAULT_TAX_CONFIG;
    }
  } catch (error) {
    console.error('Error loading tax configuration:', error);
    console.warn('Falling back to default tax configuration');
    return DEFAULT_TAX_CONFIG;
  }
}

/**
 * Get cached tax configuration or load fresh if not available
 * This can be enhanced with caching logic in the future
 */
let cachedTaxConfig: TaxConfiguration | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTaxConfiguration(forceRefresh: boolean = false): Promise<TaxConfiguration> {
  const now = Date.now();
  
  if (!forceRefresh && cachedTaxConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedTaxConfig;
  }
  
  cachedTaxConfig = await loadTaxConfiguration();
  cacheTimestamp = now;
  
  return cachedTaxConfig;
}

/**
 * Clear cache to force fresh load on next request
 */
export function clearTaxConfigurationCache(): void {
  cachedTaxConfig = null;
  cacheTimestamp = 0;
}