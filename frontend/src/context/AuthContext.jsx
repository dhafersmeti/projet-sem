import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Charger le token/user depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('jwt_token')
    const savedUser  = localStorage.getItem('user_info')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (loginResponse) => {
    const { token, ...userInfo } = loginResponse
    setToken(token)
    setUser(userInfo)
    localStorage.setItem('jwt_token', token)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_info')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
