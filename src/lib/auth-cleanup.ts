/**
 * Utility functions for cleaning up authentication state and user data
 */

/**
 * Clean up all authentication-related data from localStorage
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Clean up all user-specific data from localStorage
 * This includes jobs, contacts, responses, and interviews
 */
export const cleanupUserData = (excludeUserId?: string) => {
  const userDataKeys = ['jobs_', 'contacts_', 'responses_', 'interviews_'];
  
  Object.keys(localStorage).forEach((key) => {
    // Check if this is a user-specific data key
    const isUserDataKey = userDataKeys.some(prefix => key.startsWith(prefix));
    
    if (isUserDataKey) {
      // If excludeUserId is provided, don't remove data for that user
      if (excludeUserId && key.includes(excludeUserId)) {
        return;
      }
      localStorage.removeItem(key);
    }
  });
  
  // Also remove legacy keys that don't have user ID
  const legacyKeys = ['jobs', 'contacts', 'responses', 'interviews'];
  legacyKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Complete cleanup on logout - removes both auth state and all user data
 */
export const cleanupOnLogout = () => {
  cleanupAuthState();
  cleanupUserData();
};

/**
 * Cleanup when switching users - keeps auth state but clears user data
 */
export const cleanupOnUserSwitch = (newUserId: string) => {
  cleanupUserData(newUserId);
};