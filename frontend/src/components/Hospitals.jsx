import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { HospitalCard, SiteFooter } from './Home.jsx'
import SiteNav from './SiteNav.jsx'

function Hospitals() {
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

  return (
    <div className="site-page">
      <SiteNav />
      <header className="site-banner">
        <h1>🏥 Our Hospitals</h1>
        <p>Choose a hospital to view its doctors, specializations and consultation fees</p>
      </header>
      <main className="site-content">
        {error && <p className="site-notice error" role="alert">{error}</p>}
        {loading ? <p className="site-muted">Loading hospitals...</p> : hospitals.length ? (
          <div className="site-card-grid">
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                doctorCount={doctors.filter((doctor) => doctor.hospital?.id === hospital.id).length}
              />
            ))}
          </div>
        ) : <p className="site-empty">No hospitals yet.</p>}
      </main>
      <SiteFooter />
    </div>
  )
}

export default Hospitals
