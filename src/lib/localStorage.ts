// Safe localStorage implementation to handle cases when localStorage is not available
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Storage keys used throughout the application
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_RESUMES: 'user_resumes',
  ADMIN_USERS: 'admin_users',
  ADMIN_DASHBOARD: 'admin_dashboard',
  RESUME_EDITOR_DATA: 'resume_editor_data',
};

// Helper function to get data with expiration check
export function getStoredData<T>(key: string): { data: T; timestamp: number } | null {
  const jsonData = safeLocalStorage.getItem(key);
  if (!jsonData) return null;
  
  try {
    const storedData = JSON.parse(jsonData);
    return storedData;
  } catch (error) {
    console.error(`Error parsing stored data for key ${key}:`, error);
    return null;
  }
}

// Helper function to store data with timestamp
export function storeData<T>(key: string, data: T): void {
  const dataWithTimestamp = {
    data,
    timestamp: Date.now(),
  };
  
  safeLocalStorage.setItem(key, JSON.stringify(dataWithTimestamp));
}

// Helper function to check if stored data is stale
export function isDataStale(timestamp: number, maxAgeMs = 30 * 60 * 1000): boolean {
  // Default max age is 30 minutes
  return Date.now() - timestamp > maxAgeMs;
} 