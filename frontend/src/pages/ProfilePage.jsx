import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProfilePage({ user, setUser }) {
  const [form, setForm] = useState(user)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setUser(form)
    localStorage.setItem('medfusion-user', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="details-page">
      <div className="details-card">
        <div className="details-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="small">Your profile</p>
            <h2>{form.name}</h2>
            <p>{form.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="action">Home</button>
            </Link>
            <button className="main-btn">Details</button>
          </div>
        </div>
        <div className="details-grid">
          <div>
            <strong>Name</strong>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <strong>Email</strong>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <strong>Age</strong>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <div>
            <strong>Gender</strong>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <strong>Phone</strong>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="action" onClick={save}>Save profile</button>
          {saved && <span style={{ color: '#059669' }}> Saved!</span>}
        </div>
      </div>
      <div className="details-card">
        <h3>Medical notes</h3>
        <textarea
          style={{ width: '100%', minHeight: '100px', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px' }}
          value={form.notes || ''}
          placeholder="Add medical notes..."
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  )
}
