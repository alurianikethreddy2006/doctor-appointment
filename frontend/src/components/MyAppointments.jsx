import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api.js'
import SiteNav from './SiteNav.jsx'
import { SiteFooter } from './Home.jsx'

function getUser() {
  try {
    const storedUser = window.localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function formatTime(time) {
  const [hours, minutes] = String(time || '').substring(0, 5).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time || '-'
  return `${(hours + 11) % 12 + 1}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function MyAppointments() {
  const user = getUser()
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return
    setError('')
    const data = await api(`/api/appointments/patient/${user.id}`)
    setAppointments(data.sort((a, b) => (
      `${b.appointmentDate}${b.appointmentTime}`.localeCompare(`${a.appointmentDate}${a.appointmentTime}`)
    )))
  }, [user?.id])

  useEffect(() => {
    let active = true
    if (!user?.id) return undefined

    api(`/api/appointments/patient/${user.id}`)
      .then((data) => {
        if (active) {
          setAppointments(data.sort((a, b) => (
            `${b.appointmentDate}${b.appointmentTime}`.localeCompare(`${a.appointmentDate}${a.appointmentTime}`)
          )))
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load appointments.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  if (!user) return <Navigate to="/login" replace />

  async function cancelAppointment(id) {
    if (!window.confirm('Cancel this appointment?')) return
    setCancellingId(id)
    setError('')

    try {
      await api(`/api/appointments/${id}/cancel`, { method: 'PUT' })
      await loadAppointments()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Unable to cancel appointment.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="site-page">
      <SiteNav />
      <header className="site-banner">
        <h1>🗓️ My Appointments</h1>
        <p>View and manage your bookings</p>
      </header>
      <main className="site-content">
        {error && <p className="site-notice error" role="alert">{error}</p>}
        {loading ? <p className="site-muted">Loading your appointments...</p> : appointments.length ? (
          <div className="site-appointment-list">
            {appointments.map((appointment) => {
              const doctor = appointment.doctor || {}
              const hospital = doctor.hospital || {}
              const initials = String(doctor.name || '?')
                .replace(/^Dr\.?\s*/i, '')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()

              return (
                <article key={appointment.id} className={`site-appointment-card ${appointment.status}`}>
                  <span className="site-avatar" aria-hidden="true">{initials}</span>
                  <div className="site-appointment-main">
                    <h2>{doctor.name || '-'} <span className="site-specialization">{doctor.specialization || ''}</span></h2>
                    <p>🏥 <strong>{hospital.name || '-'}</strong></p>
                    <p>📍 {hospital.address || ''}{hospital.city ? `, ${hospital.city}` : ''}</p>
                    <p>📅 {appointment.appointmentDate} &nbsp; ⏰ {formatTime(appointment.appointmentTime)}</p>
                  </div>
                  <div className="site-appointment-status">
                    <div className="site-fee">Fee<strong>{formatMoney(appointment.fee)}</strong></div>
                    <span className={`site-badge ${appointment.status}`}>{appointment.status}</span>
                  </div>
                  {appointment.status === 'BOOKED' && (
                    <button
                      className="site-cancel-button"
                      type="button"
                      disabled={cancellingId === appointment.id}
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <section className="site-empty-card">
            <p>No appointments yet.</p>
            <Link className="site-primary-button" to="/hospitals">Book Your First Appointment</Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default MyAppointments
