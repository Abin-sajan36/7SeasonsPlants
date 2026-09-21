export type SupportedDeliveryState = 'Kerala' | 'Tamil Nadu' | 'Karnataka';

export const SUPPORTED_DELIVERY_STATES: readonly SupportedDeliveryState[] = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
] as const;

export const KERALA_DISTRICTS: readonly string[] = [
  'Alappuzha',
  'Ernakulam',
  'Idukki',
  'Kannur',
  'Kasaragod',
  'Kollam',
  'Kottayam',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Pathanamthitta',
  'Thiruvananthapuram',
  'Thrissur',
  'Wayanad',
];

export const TAMIL_NADU_DISTRICTS: readonly string[] = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thoothukudi',
  'Dindigul',
  'Thanjavur',
  'Ranipet',
  'Virudhunagar',
  'Karur',
  'Nilgiris',
  'Kanyakumari',
  'Kanchipuram',
  'Tiruvallur',
  'Cuddalore',
  'Dharmapuri',
  'Krishnagiri',
  'Nagapattinam',
  'Namakkal',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Sivaganga',
  'Tenkasi',
  'Theni',
  'Tirupathur',
  'Tiruppur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Viluppuram',
];

export const KARNATAKA_DISTRICTS: readonly string[] = [
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru',
  'Belagavi',
  'Hubballi-Dharwad',
  'Tumakuru',
  'Udupi',
  'Shivamogga',
  'Ballari',
  'Davanagere',
  'Vijayapura',
  'Kalaburagi',
  'Hassan',
  'Bidar',
  'Bagalkote',
  'Chamarajanagara',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Gadag',
  'Haveri',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Raichur',
  'Ramanagara',
  'Uttara Kannada',
  'Vijayanagara',
  'Yadgir',
];

export const STATE_PIN_CONFIG = {
  Kerala: {
    prefixes: ['67', '68', '69'],
    prefixLabel: 'starts with 67, 68, or 69',
    sample: '682030 (Ernakulam)',
    defaultDistrict: 'Ernakulam',
    defaultCity: 'Ernakulam',
  },
  'Tamil Nadu': {
    prefixes: ['60', '61', '62', '63', '64'],
    prefixLabel: 'starts with 60, 61, 62, 63, or 64',
    sample: '641001 (Coimbatore)',
    defaultDistrict: 'Chennai',
    defaultCity: 'Chennai',
  },
  Karnataka: {
    prefixes: ['56', '57', '58', '59'],
    prefixLabel: 'starts with 56, 57, 58, or 59',
    sample: '560001 (Bengaluru)',
    defaultDistrict: 'Bengaluru Urban',
    defaultCity: 'Bengaluru',
  },
} as const;

export function getDistrictsForState(state: string): readonly string[] {
  if (state === 'Kerala') return KERALA_DISTRICTS;
  if (state === 'Tamil Nadu') return TAMIL_NADU_DISTRICTS;
  if (state === 'Karnataka') return KARNATAKA_DISTRICTS;
  return [];
}

/**
 * Detects whether a 6-digit PIN code belongs to Kerala, Tamil Nadu, Karnataka, or another state in India.
 */
export function detectStateFromPincode(pincode: string): {
  detectedState: 'Kerala' | 'Tamil Nadu' | 'Karnataka' | 'Other' | null;
  isValidLength: boolean;
} {
  const clean = pincode.replace(/\D/g, '');
  if (clean.length < 2) {
    return { detectedState: null, isValidLength: false };
  }

  const prefix2 = clean.slice(0, 2);
  let detectedState: 'Kerala' | 'Tamil Nadu' | 'Karnataka' | 'Other' | null = null;

  if (['67', '68', '69'].includes(prefix2)) {
    detectedState = 'Kerala';
  } else if (['60', '61', '62', '63', '64'].includes(prefix2)) {
    detectedState = 'Tamil Nadu';
  } else if (['56', '57', '58', '59'].includes(prefix2)) {
    detectedState = 'Karnataka';
  } else if (clean.length === 6) {
    detectedState = 'Other';
  }

  return {
    detectedState,
    isValidLength: clean.length === 6,
  };
}

/**
 * Checks address text (street, apartment, landmark) for keywords that belong to other states.
 */
export function checkAddressTextMismatch(
  addressText: string,
  selectedState: SupportedDeliveryState
): { hasMismatch: boolean; conflictingTerm?: string; conflictingState?: string } {
  if (!addressText || !addressText.trim()) {
    return { hasMismatch: false };
  }

  const normalized = addressText.toLowerCase();

  const stateKeywords: Record<SupportedDeliveryState, string[]> = {
    Kerala: [
      'kerala',
      'kochi',
      'cochin',
      'ernakulam',
      'trivandrum',
      'thiruvananthapuram',
      'calicut',
      'kozhikode',
      'thrissur',
      'malappuram',
      'palakkad',
      'kannur',
      'kollam',
      'alappuzha',
      'kottayam',
      'wayanad',
    ],
    'Tamil Nadu': [
      'tamil nadu',
      'tamilnadu',
      'chennai',
      'madras',
      'coimbatore',
      'madurai',
      'trichy',
      'tiruchirappalli',
      'salem',
      'tirunelveli',
      'erode',
      'vellore',
      'kanchipuram',
      'hosur',
    ],
    Karnataka: [
      'karnataka',
      'bangalore',
      'bengaluru',
      'mysore',
      'mysuru',
      'mangaluru',
      'mangalore',
      'hubli',
      'hubballi',
      'belgaum',
      'belagavi',
      'udupi',
      'tumakuru',
      'tumkur',
    ],
  };

  const otherStates: Record<string, string[]> = {
    Maharashtra: ['maharashtra', 'mumbai', 'bombay', 'pune', 'nagpur', 'thane'],
    Telangana: ['telangana', 'hyderabad', 'secunderabad'],
    'Andhra Pradesh': ['andhra pradesh', 'visakhapatnam', 'vizag', 'vijayawada'],
    Delhi: ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram'],
    Gujarat: ['gujarat', 'ahmedabad', 'surat', 'vadodara'],
    'West Bengal': ['kolkata', 'calcutta', 'west bengal'],
  };

  // 1. Check if user selected one supported state, but typed another supported state's keywords
  for (const [st, keywords] of Object.entries(stateKeywords)) {
    if (st !== selectedState) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(normalized)) {
          return {
            hasMismatch: true,
            conflictingTerm: kw.toUpperCase(),
            conflictingState: st,
          };
        }
      }
    }
  }

  // 2. Check if user typed other national states
  for (const [st, keywords] of Object.entries(otherStates)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(normalized)) {
        return {
          hasMismatch: true,
          conflictingTerm: kw.toUpperCase(),
          conflictingState: st,
        };
      }
    }
  }

  return { hasMismatch: false };
}

export interface AddressValidationResult {
  valid: boolean;
  error?: string;
  field?: 'state' | 'district' | 'pincode' | 'address';
}

/**
 * Validates that an address is logically consistent with the mandatory selected delivery state.
 */
export function validateDeliveryAddress(params: {
  state: string;
  district: string;
  pincode: string;
  street: string;
  apartment?: string;
  selectedDeliveryState?: string | null;
}): AddressValidationResult {
  const { state, district, pincode, street, apartment = '', selectedDeliveryState } = params;

  // 1. Mandatory State Selection
  if (!state || !SUPPORTED_DELIVERY_STATES.includes(state as SupportedDeliveryState)) {
    return {
      valid: false,
      field: 'state',
      error: 'Please select a valid delivery state (Kerala, Tamil Nadu, or Karnataka).',
    };
  }

  const validState = state as SupportedDeliveryState;

  // 2. State mismatch with store browsing session state
  if (selectedDeliveryState && selectedDeliveryState !== validState) {
    return {
      valid: false,
      field: 'state',
      error: `Your address state (${validState}) does not match your active delivery destination (${selectedDeliveryState}). Please set the state to ${selectedDeliveryState} or update your destination in the top header.`,
    };
  }

  // 3. District must belong to the selected state
  const allowedDistricts = getDistrictsForState(validState);
  if (!district || !allowedDistricts.includes(district)) {
    return {
      valid: false,
      field: 'district',
      error: `District "${district || 'None'}" does not belong to ${validState}. Please choose a district within ${validState}.`,
    };
  }

  // 4. PIN Code validation and State Match
  const cleanPin = pincode.replace(/\D/g, '');
  if (!cleanPin || cleanPin.length !== 6) {
    return {
      valid: false,
      field: 'pincode',
      error: 'Please enter a complete 6-digit postal PIN code.',
    };
  }

  const { detectedState } = detectStateFromPincode(cleanPin);
  const stateConfig = STATE_PIN_CONFIG[validState];

  if (detectedState !== validState) {
    if (detectedState && detectedState !== 'Other') {
      return {
        valid: false,
        field: 'pincode',
        error: `PIN code "${cleanPin}" belongs to ${detectedState}, but you selected ${validState} as your delivery state. Postal PIN for ${validState} ${stateConfig.prefixLabel}.`,
      };
    }
    return {
      valid: false,
      field: 'pincode',
      error: `PIN code "${cleanPin}" does not match ${validState}. Postal PIN for ${validState} ${stateConfig.prefixLabel} (e.g. ${stateConfig.sample}).`,
    };
  }

  // 5. Cross-State Address Text Mismatch
  const fullAddressText = `${street} ${apartment}`;
  const textMismatch = checkAddressTextMismatch(fullAddressText, validState);
  if (textMismatch.hasMismatch) {
    return {
      valid: false,
      field: 'address',
      error: `Your address text mentions "${textMismatch.conflictingTerm}" (${textMismatch.conflictingState}), but your delivery state is set to ${validState}. 7Seasons ships live plants strictly to the selected state. Please correct your address or switch to ${textMismatch.conflictingState}.`,
    };
  }

  return { valid: true };
}
