import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import SiteNav from './SiteNav.jsx'

function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
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

  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort()

  function searchDoctors(event) {
    event.preventDefault()
    navigate(`/doctors${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <div className="site-page">
      <SiteNav />
      <section className="home-hero">
        <h1>Book Your Doctor Appointment Online</h1>
        <p>Choose from top hospitals, find the right specialist, check the fee and book your slot in a minute.</p>
        <form className="home-search" onSubmit={searchDoctors}>
          <input
            aria-label="Search doctor or specialization"
            placeholder="Search doctor or specialization (e.g. Cardiologist)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="site-primary-button" type="submit">Search</button>
        </form>
      </section>

      <section className="site-stats" aria-label="MediBook statistics">
        <div className="site-stat"><strong>{loading ? '—' : hospitals.length}</strong><span>Hospitals</span></div>
        <div className="site-stat"><strong>{loading ? '—' : doctors.length}</strong><span>Doctors</span></div>
        <div className="site-stat"><strong>{loading ? '—' : specializations.length}</strong><span>Specializations</span></div>
        <div className="site-stat"><strong>24x7</strong><span>Online Booking</span></div>
      </section>

      <main>
        {error && <p className="site-notice error" role="alert">{error}</p>}
        <section className="site-section">
          <h2>🏥 Our Hospitals</h2>
          <p className="site-section-subtitle">Pick a hospital to see its doctors and fees.</p>
          {loading ? <p className="site-muted">Loading hospitals...</p> : (
            <>
              <div className="site-card-grid">
                {hospitals.slice(0, 3).map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    doctorCount={doctors.filter((doctor) => doctor.hospital?.id === hospital.id).length}
                  />
                ))}
              </div>
              {!hospitals.length && <p className="site-empty">No hospitals yet.</p>}
              <p className="site-centered-link"><Link className="site-secondary-button" to="/hospitals">See All Hospitals</Link></p>
            </>
          )}
        </section>

        <section className="site-section">
          <h2>🩺 Browse by Specialization</h2>
          <p className="site-section-subtitle">Click a specialization to see matching doctors.</p>
          <div className="site-chips">
            {specializations.map((specialization) => (
              <Link
                key={specialization}
                className="site-chip"
                to={`/doctors?q=${encodeURIComponent(specialization)}`}
              >
                {specialization}
              </Link>
            ))}
            {!loading && !specializations.length && <span className="site-muted">No specializations available.</span>}
          </div>
        </section>

        <section className="site-section site-how-it-works">
          <h2>How It Works</h2>
          <p className="site-section-subtitle">Three easy steps</p>
          <div className="site-steps">
            <article><span>🏥</span><h3>1. Choose Hospital</h3><p>Browse hospitals with their address and doctors.</p></article>
            <article><span>👨‍⚕️</span><h3>2. Pick a Doctor</h3><p>Compare specialization, experience and fee.</p></article>
            <article><span>📅</span><h3>3. Book a Slot</h3><p>Select date and time and confirm instantly.</p></article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export function HospitalCard({ hospital, doctorCount }) {
  const [image, setImage] = useState(hospital.imageUrl || '/images/hospital-default.svg')

  return (
    <article className="site-hospital-card">
      <img src={image} alt={hospital.name} onError={() => setImage('/images/hospital-default.svg')} />
      <div className="site-hospital-body">
        <h3>{hospital.name}</h3>
        <p className="site-card-detail">📍 {hospital.address}</p>
        <p className="site-card-detail">{hospital.city || ''}</p>
        <p className="site-card-detail">📞 {hospital.phone || '-'}</p>
        <p className="site-hospital-description">{hospital.description || ''}</p>
        <span className="site-pill">👨‍⚕️ {doctorCount} doctors</span>
        <Link className="site-primary-button full-width" to={`/doctors?hospitalId=${hospital.id}`}>View Doctors</Link>
      </div>
    </article>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <strong>🏥 MediBook</strong> – Online Doctor Appointment System
      <br />
      Java Full Stack Project • Spring Boot + MySQL + React
    </footer>
  )
}

export default Home
