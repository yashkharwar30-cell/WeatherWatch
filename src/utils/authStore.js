// Authentication State Management Utility for WeatherWatch Admin MVP

const AUTH_STORAGE_KEY = 'weatherwatch_admin_auth';

export function isAdminAuthenticated() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.isAuthenticated);
  } catch (e) {
    return false;
  }
}

export function setAdminAuth(email) {
  try {
    const authData = {
      isAuthenticated: true,
      email: email || 'admin@weatherwatch.demo',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (e) {
    console.error('Failed to set admin auth', e);
  }
}

export function clearAdminAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear admin auth', e);
  }
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
