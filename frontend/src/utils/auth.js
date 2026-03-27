export const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:5000`

export const initialUser = {
  name: 'MedFusion User',
  email: '',
  age: 25,
  gender: 'Other',
  phone: '',
}

export function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback
  } catch {
    return fallback
  }
}

export function clearSession(setToken, setUser, navigate, messageSetter) {
  localStorage.removeItem('medfusion-token')
  localStorage.removeItem('medfusion-user')
  setToken('')
  setUser(initialUser)
  if (messageSetter) messageSetter('Session expired. Please log in again.')
  if (navigate) navigate('/')
}

export function isAuthError(status, data) {
  if (!status) return false
  if (status === 401 || status === 422) return true
  const msg = ((data && (data.msg || data.message || data.error)) || '').toLowerCase()
  return msg.includes('token') || msg.includes('authorization') || msg.includes('expired')
}
