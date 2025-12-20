import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'
import { STORAGE_KEYS } from '../utils/constants'

const AuthContext = createContext()

const getStored = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStored(STORAGE_KEYS.USER))
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/users/current-user')
        setUser(data?.data)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data?.data))
      } catch (err) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const login = async (credentials) => {
    setError(null)
    const { data } = await api.post('/users/login', credentials)
    const accessToken = data?.data?.accessToken
    const userData = data?.data?.user

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
      setUser(userData)
      setToken(accessToken)
    }

    return userData
  }

  const register = async (formData) => {
    setError(null)
    const { data } = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data?.data
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      setUser(null)
      setToken(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      logout,
      register,
    }),
    [user, token, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}




