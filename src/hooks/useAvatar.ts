import { useEffect, useState } from 'react';
import { safeLocalStorage } from '@/lib/localStorage';

// Avatar cache duration in minutes
const AVATAR_CACHE_DURATION = 30;

interface UseAvatarOptions {
  priority?: boolean; // Whether to use priority loading
  cacheKey?: string;  // Custom cache key prefix
}

/**
 * Hook for optimized avatar loading with multiple caching strategies
 * 
 * @param userId User ID for the avatar
 * @param avatarUrl The avatar URL
 * @param options Options for avatar loading
 * @returns {object} Object containing avatar loading state
 */
export function useAvatar(
  userId: string | undefined, 
  avatarUrl: string | undefined,
  options: UseAvatarOptions = {}
) {
  const [loadedAvatarSrc, setLoadedAvatarSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { priority = false, cacheKey = 'avatar_cache' } = options;

  useEffect(() => {
    // Reset state when userId or avatarUrl changes
    setIsLoading(true);
    setError(null);
    
    if (!userId || !avatarUrl) {
      setLoadedAvatarSrc(null);
      setIsLoading(false);
      return;
    }
    
    const avatarCacheKey = `${cacheKey}_${userId}`;
    
    const loadAvatar = async () => {
      try {
        // 1. Check for cached avatar in localStorage
        const cachedAvatarUrl = safeLocalStorage.getItem(avatarCacheKey);
        const cachedTimestamp = safeLocalStorage.getItem(`${avatarCacheKey}_time`);
        
        // Calculate if cache is still valid
        const isCacheValid = cachedTimestamp && 
          (Date.now() - parseInt(cachedTimestamp, 10)) < (AVATAR_CACHE_DURATION * 60 * 1000);
          
        if (cachedAvatarUrl && isCacheValid && cachedAvatarUrl === avatarUrl) {
          // Use the cached avatar immediately
          setLoadedAvatarSrc(cachedAvatarUrl);
          setIsLoading(false);
        }
        
        // 2. Always load the fresh avatar in the background to update cache
        const img = new window.Image();
        img.src = avatarUrl;
        
        img.onload = () => {
          setLoadedAvatarSrc(avatarUrl);
          setIsLoading(false);
          
          // Update cache with fresh avatar and timestamp
          safeLocalStorage.setItem(avatarCacheKey, avatarUrl);
          safeLocalStorage.setItem(`${avatarCacheKey}_time`, Date.now().toString());
        };
        
        img.onerror = () => {
          setError(new Error('Failed to load avatar'));
          setIsLoading(false);
          
          // If we had a valid cached version, continue using it
          if (!loadedAvatarSrc && cachedAvatarUrl) {
            setLoadedAvatarSrc(cachedAvatarUrl);
          } else {
            setLoadedAvatarSrc(null);
          }
        };
        
      } catch (err) {
        console.error('Error loading avatar:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading avatar'));
        setIsLoading(false);
      }
    };
    
    // Load avatar
    loadAvatar();
    
    // Cleanup function
    return () => {
      // Nothing to clean up
    };
  }, [userId, avatarUrl, cacheKey]);
  
  return {
    avatarSrc: loadedAvatarSrc,
    isLoading,
    error,
    // Additional utility methods
    getAvatarProps: () => ({
      src: loadedAvatarSrc || '',
      priority,
      loading: priority ? 'eager' : 'lazy',
    }),
  };
} 