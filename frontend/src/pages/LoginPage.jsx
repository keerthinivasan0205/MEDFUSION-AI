import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, initialUser } from '../utils/auth'

export default function LoginPage({ setToken, setUser }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter credentials')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        const userData = {
          ...initialUser,
          name: data.user?.name || 'MedFusion User',
          email: data.user?.email || form.email,
        }
        localStorage.setItem('medfusion-token', data.access_token)
        localStorage.setItem('medfusion-user', JSON.stringify(userData))
        setToken(data.access_token)
        setUser(userData)
        navigate('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Failed to connect to backend')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login to MedFusion</h1>
        <p>Access your AI diagnostics dashboard.</p>
        <label>Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <p>
          New? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  )
}
