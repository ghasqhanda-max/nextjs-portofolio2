/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted Rupiah string
 */
export function formatRupiah(amount: number, options: {
  prefix?: string
  suffix?: string
  compact?: boolean
} = {}): string {
  const { prefix = 'Rp ', suffix = '', compact = false } = options
  
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${prefix}0${suffix}`
  }

  let formattedAmount: string
  
  if (compact && amount >= 1000000) {
    // Compact format for large numbers (e.g., 1.5M, 2.3M)
    const millions = amount / 1000000
    formattedAmount = millions % 1 === 0 
      ? `${millions}jt` 
      : `${millions.toFixed(1)}jt`
  } else if (compact && amount >= 1000) {
    // Compact format for thousands (e.g., 500rb)
    const thousands = amount / 1000
    formattedAmount = `${thousands}rb`
  } else {
    // Standard format with proper thousand separators
    formattedAmount = amount.toLocaleString('id-ID')
  }

  return `${prefix}${formattedAmount}${suffix}`
}

/**
 * Parse Rupiah string back to number
 * @param rupiahString - The Rupiah string to parse
 * @returns Parsed number
 */
export function parseRupiah(rupiahString: string): number {
  // Remove "Rp ", "jt", "rb", and all non-digit characters
  const cleaned = rupiahString
    .replace(/Rp\s*/g, '')
    .replace(/jt/g, '000000')
    .replace(/rb/g, '000')
    .replace(/[^\d]/g, '')
  
  return parseInt(cleaned, 10) || 0
}

/**
 * Format price range for property listings
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatRupiah(minPrice)
  }
  
  return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`
}

/**
 * Get price tier label for property categorization
 * @param price - Property price
 * @returns Price tier label
 */
export function getPriceTier(price: number): {
  label: string
  color: string
  bgColor: string
} {
  if (price < 500000000) {
    return {
      label: 'Ekonomis',
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    }
  } else if (price < 1000000000) {
    return {
      label: 'Menengah',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100'
    }
  } else if (price < 5000000000) {
    return {
      label: 'Premium',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100'
    }
  } else {
    return {
      label: 'Mewah',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100'
    }
  }
}
