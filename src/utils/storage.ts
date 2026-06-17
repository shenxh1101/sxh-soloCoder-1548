const STORAGE_PREFIX = 'store_manager_';

export function getStorageKey(key: string): string {
  return STORAGE_PREFIX + key;
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    if (data === null) {
      return defaultValue;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('读取数据失败:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('删除数据失败:', error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('清空数据失败:', error);
  }
}
