// Use environment variable in production, fallback to localhost for dev
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'yt_access_token',
  USER: 'yt_user',
};




