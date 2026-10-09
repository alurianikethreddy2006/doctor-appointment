import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { SiteFooter } from './Home.jsx'
import SiteNav from './SiteNav.jsx'

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function DoctorCard({ doctor }) {
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
    <article className="site-doctor-card">
      <div className="site-doctor-heading">
        <span className="site-avatar" aria-hidden="true">{initials}</span>
        <div>
          <h2>{doctor.name}</h2>
          <span className="site-specialization">{doctor.specialization}</span>
        </div>
      </div>
      <p className="site-qualification">🎓 {doctor.qualification || ''} • {doctor.experience} yrs experience</p>
      <div className="site-doctor-hospital">
        <strong>🏥 {hospital.name || '-'}</strong>
        <span>📍 {hospital.address || ''}{hospital.city ? `, ${hospital.city}` : ''}</span>
      </div>
      <p className="site-card-detail">📅 {doctor.availableDays || '-'}</p>
      <p className="site-card-detail">⏰ {doctor.timings || '-'}</p>
      <div className="site-doctor-footer">
        <div className="site-fee">Consultation Fee<strong>{formatMoney(doctor.fee)}</strong></div>
        <Link className="site-primary-button" to={`/book?doctorId=${doctor.id}`}>Book Now</Link>
      </div>
    </article>
  )
}

function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [specialization, setSpecialization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([api('/api/hospitals'), api('/api/doctors')])
      .then(([hospitalData, doctorData]) => {
        if (!active) return
        setHospitals(hospitalData)
        setDoctors(doctorData)
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const specializations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort(),
    [doctors],
  )
  const query = searchParams.get('q') || ''
  const hospitalId = searchParams.get('hospitalId') || ''
  const filteredDoctors = doctors.filter((doctor) => (
    (!hospitalId || String(doctor.hospital?.id) === hospitalId)
    && (!specialization || doctor.specialization === specialization)
    && (!query.trim()
      || doctor.name.toLowerCase().includes(query.trim().toLowerCase())
      || doctor.specialization.toLowerCase().includes(query.trim().toLowerCase()))
  ))

  function updateSearch(key, value) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(key, value)
    else nextParams.delete(key)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="site-page">
      <SiteNav />
      <header className="site-banner">
        <h1>👨‍⚕️ Find Your Doctor</h1>
        <p>Filter by hospital or specialization and book instantly</p>
      </header>
      <main className="site-content">
        <div className="site-filters">
          <input
            aria-label="Search name or specialization"
            placeholder="🔎 Search name or specialization"
            value={query}
            onChange={(event) => updateSearch('q', event.target.value)}
          />
          <select
            aria-label="Filter by hospital"
            value={hospitalId}
            onChange={(event) => updateSearch('hospitalId', event.target.value)}
          >
            <option value="">All Hospitals</option>
            {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
          <select
            aria-label="Filter by specialization"
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        {error && <p className="site-notice error" role="alert">{error}</p>}
        {loading ? <p className="site-muted">Loading doctors...</p> : filteredDoctors.length ? (
          <div className="site-card-grid">
            {filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        ) : <p className="site-empty">No doctors found.</p>}
      </main>
      <SiteFooter />
    </div>
  )
}

export default Doctors
