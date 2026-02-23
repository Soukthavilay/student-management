import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

export async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;

    const { data, expiry } = JSON.parse(raw);
    if (expiry && Date.now() > expiry) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const expiry = Date.now() + ttl;
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({ data, expiry }));
  } catch {
    // Silently fail — cache is optional
  }
}

export async function clearCache(key) {
  try {
    if (key) {
      await AsyncStorage.removeItem(`cache_${key}`);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    }
  } catch {
    // Silently fail
  }
}
