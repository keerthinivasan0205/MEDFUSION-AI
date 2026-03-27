import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../utils/auth'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage('Complete all fields')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Registered. Redirecting to login...')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setMessage(data.message || 'Register failed')
      }
    } catch {
      setMessage('Cannot reach backend')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Start diagnosing with MedFusion AI.</p>
        <label>Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
        />
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
        <button onClick={handleSignUp}>Sign Up</button>
        {message && <p style={{ color: '#dc2626' }}>{message}</p>}
        <p>
          Already a member? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  )
}
