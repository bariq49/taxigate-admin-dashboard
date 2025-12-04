/**
 * Cookie Utilities
 * Helper functions to manage cookies on client-side
 */

export const cookies = {
  /**
   * Set a cookie
   */
  set: (name: string, value: string, days: number = 7): void => {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  /**
   * Get a cookie value
   */
  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  },

  /**
   * Remove a cookie
   */
  remove: (name: string): void => {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
  },

  /**
   * Check if a cookie exists
   */
  has: (name: string): boolean => {
    return cookies.get(name) !== null;
  },
};

// Cookie keys
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  ADMIN_DATA: 'adminData',
} as const;

