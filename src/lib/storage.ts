/**
 * Safe, Quota-Resilient Storage Utility
 * Prevents QuotaExceededError crashes from uncaught localStorage.setItem calls in React components.
 */

const CACHE_EVICTION_KEYS = [
  '7seasonsplants_app_data_v1_combos',
  '7seasonsplants_app_data_v1_products',
  '7seasonsplants_app_data_v1_blogs',
  '7seasonsplants_app_data_v1_reels',
  '7seasonsplants_app_data_v1_guides',
  '7seasonsplants_app_data_v1_banners',
  '7seasonsplants_app_data_v1_reviews',
  '7seasonsplants_app_data_v1_registered_users',
  '7seasonsplants_app_data_v1_orders',
];

/**
 * Safely writes a key-value pair to localStorage.
 * If quota is exceeded, non-critical collections (which are live in Firestore)
 * are evicted to free up space, and the write is retried.
 * Never throws an unhandled DOMException QuotaExceededError into React effects.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      err?.message?.includes?.('quota') ||
      err?.message?.includes?.('QuotaExceeded');

    if (!isQuotaError) {
      console.warn(`[Storage Warning] Error writing key "${key}":`, err?.message || err);
      return false;
    }

    // Quota exceeded: Evict non-critical cached collections
    console.warn(`[Storage Quota Management] Quota exceeded while writing "${key}". Evicting cached catalog data...`);

    let evictedCount = 0;
    for (const evictionKey of CACHE_EVICTION_KEYS) {
      if (evictionKey !== key && localStorage.getItem(evictionKey) !== null) {
        try {
          localStorage.removeItem(evictionKey);
          evictedCount++;
        } catch {
          // Ignore removal error
        }
      }
    }

    // Also look for any keys starting with '7seasonsplants_app_data_v1_deleted_'
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key && k.startsWith('7seasonsplants_app_data_v1_deleted_')) {
          localStorage.removeItem(k);
          evictedCount++;
        }
      }
    } catch {
      // Ignore enumeration error
    }

    // Retry writing the item now that cache space has been freed
    try {
      localStorage.setItem(key, value);
      console.info(`[Storage Quota Management] Successfully saved "${key}" after evicting ${evictedCount} cached collections.`);
      return true;
    } catch (retryErr: any) {
      console.warn(`[Storage Quota Management] Key "${key}" still exceeds quota after eviction. Skipping local cache.`);
      return false;
    }
  }
}

/**
 * Safely reads a key from localStorage.
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (err: any) {
    console.warn(`[Storage Warning] Error reading key "${key}":`, err?.message || err);
    return null;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (err: any) {
    console.warn(`[Storage Warning] Error removing key "${key}":`, err?.message || err);
  }
}

/**
 * Strips huge base64 strings or deeply nested payloads from user object before local caching.
 * Full user details remain in Firestore.
 */
export function sanitizeUserForStorage<T>(user: T): T {
  if (!user || typeof user !== 'object') return user;

  const clone: any = { ...user };

  // If avatar is an inline base64 string over 2KB, don't store the raw base64 in localStorage
  if (typeof clone.avatar === 'string' && clone.avatar.startsWith('data:') && clone.avatar.length > 2048) {
    clone.avatar = ''; // Keep in Firestore, omit from localStorage
  }

  // If user has orders array embedded, truncate to latest 5 to save space
  if (Array.isArray(clone.orders) && clone.orders.length > 5) {
    clone.orders = clone.orders.slice(0, 5);
  }

  return clone as T;
}

/**
 * Strips huge payloads from registered users list before local caching.
 */
export function sanitizeUsersListForStorage<T>(users: T[]): T[] {
  if (!Array.isArray(users)) return [];

  // Store at most 50 users locally to prevent hitting quota (full list is in Firestore)
  return users.slice(0, 50).map((u: any) => {
    if (!u || typeof u !== 'object') return u;
    const clean: any = { ...u };
    if (typeof clean.avatar === 'string' && clean.avatar.startsWith('data:') && clean.avatar.length > 2048) {
      clean.avatar = '';
    }
    if (Array.isArray(clean.orders)) {
      clean.orders = clean.orders.slice(0, 2);
    }
    return clean;
  });
}
