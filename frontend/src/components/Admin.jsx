import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'hospitals', label: '🏥 Hospitals' },
  { id: 'doctors', label: '👨‍⚕️ Doctors' },
  { id: 'appointments', label: '🗓️ Appointments' },
]

const EMPTY_HOSPITAL = {
  name: '',
  address: '',
  city: '',
  phone: '',
  imageUrl: '',
  description: '',
}

const EMPTY_DOCTOR = {
  name: '',
  specialization: '',
  qualification: '',
  experience: '',
  fee: '',
  availableDays: '',
  timings: '',
  hospitalId: '',
}

async function api(url, method = 'GET', body) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message
    throw new Error(message || `Request failed (${response.status}).`)
  }

  return data
}

function fetchAdminData() {
  return Promise.all([
    api('/api/hospitals'),
    api('/api/doctors'),
    api('/api/appointments'),
  ])
}

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function formatTime(time) {
  const [hours, minutes] = String(time || '').substring(0, 5).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time || '-'
  return `${(hours + 11) % 12 + 1}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

function Admin() {
  const user = readStoredUser()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [hospitalForm, setHospitalForm] = useState(EMPTY_HOSPITAL)
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR)
  const [hospitalMessage, setHospitalMessage] = useState(null)
  const [doctorMessage, setDoctorMessage] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingHospital, setIsSavingHospital] = useState(false)
  const [isSavingDoctor, setIsSavingDoctor] = useState(false)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [hospitalData, doctorData, appointmentData] = await fetchAdminData()
      setHospitals(hospitalData)
      setDoctors(doctorData)
      setAppointments(appointmentData)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load admin data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return undefined

    let isCurrent = true
    fetchAdminData()
      .then(([hospitalData, doctorData, appointmentData]) => {
        if (!isCurrent) return
        setHospitals(hospitalData)
        setDoctors(doctorData)
        setAppointments(appointmentData)
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load admin data.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [user?.role])

  // if (user?.role !== 'ADMIN') {
  //   return <Navigate to="/login" replace />
  // }

  function updateHospital(event) {
    const { name, value } = event.target
    setHospitalForm((form) => ({ ...form, [name]: value }))
  }

  function updateDoctor(event) {
    const { name, value } = event.target
    setDoctorForm((form) => ({ ...form, [name]: value }))
  }

  async function addHospital(event) {
    event.preventDefault()
    setHospitalMessage(null)
    setIsSavingHospital(true)

    try {
      await api('/api/hospitals', 'POST', hospitalForm)
      setHospitalForm(EMPTY_HOSPITAL)
      setHospitalMessage({ text: 'Hospital added!', success: true })
      await loadAll()
    } catch (error) {
      setHospitalMessage({
        text: error instanceof Error ? error.message : 'Unable to add hospital.',
        success: false,
      })
    } finally {
      setIsSavingHospital(false)
    }
  }

  async function addDoctor(event) {
    event.preventDefault()
    setDoctorMessage(null)
    setIsSavingDoctor(true)

    try {
      await api('/api/doctors', 'POST', {
        name: doctorForm.name.trim(),
        specialization: doctorForm.specialization.trim(),
        qualification: doctorForm.qualification.trim(),
        experience: Number.parseInt(doctorForm.experience || '0', 10),
        fee: Number.parseInt(doctorForm.fee || '0', 10),
        availableDays: doctorForm.availableDays.trim(),
        timings: doctorForm.timings.trim(),
        hospital: { id: Number.parseInt(doctorForm.hospitalId, 10) },
      })
      setDoctorForm(EMPTY_DOCTOR)
      setDoctorMessage({ text: 'Doctor added!', success: true })
      await loadAll()
    } catch (error) {
      setDoctorMessage({
        text: error instanceof Error ? error.message : 'Unable to add doctor.',
        success: false,
      })
    } finally {
      setIsSavingDoctor(false)
    }
  }

  async function deleteHospital(hospital) {
    if (!window.confirm(`Delete ${hospital.name}?`)) return

    try {
      await api(`/api/hospitals/${hospital.id}`, 'DELETE')
      setHospitalMessage(null)
      await loadAll()
    } catch (error) {
      setHospitalMessage({
        text: error instanceof Error ? `Cannot delete hospital: ${error.message}` : 'Cannot delete hospital.',
        success: false,
      })
    }
  }

  async function deleteDoctor(doctor) {
    if (!window.confirm(`Delete ${doctor.name}?`)) return

    try {
      await api(`/api/doctors/${doctor.id}`, 'DELETE')
      setDoctorMessage(null)
      await loadAll()
    } catch (error) {
      setDoctorMessage({
        text: error instanceof Error ? `Cannot delete doctor: ${error.message}` : 'Cannot delete doctor.',
        success: false,
      })
    }
  }

  function logout() {
    window.localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav" aria-label="Main navigation">
        <Link className="admin-logo" to="/register">🏥 MediBook</Link>
        <Link to="/register">Home</Link>
        <Link to="/hospitals">Hospitals</Link>
        <Link className="admin-nav-active" to="/admin">⚙️ Admin Panel</Link>
        <button className="admin-logout" type="button" onClick={logout}>Logout</button>
      </nav>

      <header className="admin-banner">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage hospitals, doctors and appointments</p>
      </header>

      <main className="admin-container">
        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadError && (
          <div className="admin-alert error" role="alert">
            {loadError}{' '}
            <button type="button" onClick={loadAll}>Try again</button>
          </div>
        )}

        {isLoading && <p className="admin-loading" role="status">Loading admin data...</p>}

        {!isLoading && (
          <>
            {activeTab === 'overview' && (
              <section id="overview-panel" className="admin-panel" role="tabpanel" aria-labelledby="overview-tab">
                <div className="admin-stats">
                  <div className="admin-stat"><strong>{hospitals.length}</strong><span>Hospitals</span></div>
                  <div className="admin-stat"><strong>{doctors.length}</strong><span>Doctors</span></div>
                  <div className="admin-stat"><strong>{appointments.length}</strong><span>Total Appointments</span></div>
                  <div className="admin-stat"><strong>{appointments.filter((appointment) => appointment.status === 'BOOKED').length}</strong><span>Active Bookings</span></div>
                </div>
                <section className="admin-card">
                  <h2>Welcome, Admin</h2>
                  <p>Use the tabs above to add new hospitals, add doctors to a hospital (with fee and timings), or review all patient appointments.</p>
                </section>
              </section>
            )}

            {activeTab === 'hospitals' && (
              <section id="hospitals-panel" className="admin-panel" role="tabpanel" aria-labelledby="hospitals-tab">
                <section className="admin-card">
                  <h2>Add New Hospital</h2>
                  <form onSubmit={addHospital}>
                    <div className="admin-form-grid">
                      <label>Hospital Name *
                        <input name="name" value={hospitalForm.name} onChange={updateHospital} placeholder="City Care Hospital" required />
                      </label>
                      <label>Address *
                        <input name="address" value={hospitalForm.address} onChange={updateHospital} placeholder="Road No. 12, Banjara Hills" required />
                      </label>
                      <label>City / PIN
                        <input name="city" value={hospitalForm.city} onChange={updateHospital} placeholder="Hyderabad - 500034" />
                      </label>
                      <label>Phone
                        <input name="phone" value={hospitalForm.phone} onChange={updateHospital} placeholder="040-4000 1001" />
                      </label>
                      <label>Image path or link
                        <input name="imageUrl" value={hospitalForm.imageUrl} onChange={updateHospital} placeholder="images/hospital1.svg (blank = default)" />
                      </label>
                      <label>Short description
                        <input name="description" value={hospitalForm.description} onChange={updateHospital} placeholder="Multispeciality hospital..." />
                      </label>
                    </div>
                    <button className="admin-primary-button" type="submit" disabled={isSavingHospital}>
                      {isSavingHospital ? 'Adding...' : '➕ Add Hospital'}
                    </button>
                  </form>
                  {hospitalMessage && (
                    <p className={`admin-alert ${hospitalMessage.success ? 'success' : 'error'}`} role="status">
                      {hospitalMessage.text}
                    </p>
                  )}
                </section>

                <section className="admin-card">
                  <h2>All Hospitals</h2>
                  <div className="admin-table-wrap">
                    <table>
                      <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Address</th><th>Phone</th><th>Doctors</th><th>Actions</th></tr></thead>
                      <tbody>
                        {hospitals.length === 0 ? (
                          <tr><td colSpan="7">No hospitals yet.</td></tr>
                        ) : hospitals.map((hospital) => (
                          <tr key={hospital.id}>
                            <td>{hospital.id}</td>
                            <td>
                              <img
                                className="admin-hospital-image"
                                src={hospital.imageUrl || '/images/hospital-default.svg'}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.onerror = null
                                  event.currentTarget.src = '/images/hospital-default.svg'
                                }}
                              />
                            </td>
                            <td><strong>{hospital.name}</strong></td>
                            <td>{hospital.address}<br /><small>{hospital.city || ''}</small></td>
                            <td>{hospital.phone || ''}</td>
                            <td>{doctors.filter((doctor) => doctor.hospital?.id === hospital.id).length}</td>
                            <td><button className="admin-delete-button" type="button" onClick={() => deleteHospital(hospital)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            )}

            {activeTab === 'doctors' && (
              <section id="doctors-panel" className="admin-panel" role="tabpanel" aria-labelledby="doctors-tab">
                <section className="admin-card">
                  <h2>Add New Doctor</h2>
                  <form onSubmit={addDoctor}>
                    <div className="admin-form-grid">
                      <label>Hospital *
                        <select name="hospitalId" value={doctorForm.hospitalId} onChange={updateDoctor} required>
                          <option value="">Select a hospital</option>
                          {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
                        </select>
                      </label>
                      <label>Doctor Name *
                        <input name="name" value={doctorForm.name} onChange={updateDoctor} placeholder="Dr. Meena Rao" required />
                      </label>
                      <label>Specialization *
                        <input name="specialization" value={doctorForm.specialization} onChange={updateDoctor} placeholder="Neurologist" required />
                      </label>
                      <label>Qualification
                        <input name="qualification" value={doctorForm.qualification} onChange={updateDoctor} placeholder="MBBS, MD" />
                      </label>
                      <label>Experience (years)
                        <input name="experience" type="number" min="0" value={doctorForm.experience} onChange={updateDoctor} placeholder="10" />
                      </label>
                      <label>Consultation Fee (₹) *
                        <input name="fee" type="number" min="0" value={doctorForm.fee} onChange={updateDoctor} placeholder="600" required />
                      </label>
                      <label>Available Days
                        <input name="availableDays" value={doctorForm.availableDays} onChange={updateDoctor} placeholder="Mon,Wed,Fri" />
                      </label>
                      <label>Timings
                        <input name="timings" value={doctorForm.timings} onChange={updateDoctor} placeholder="10:00 AM - 4:00 PM" />
                      </label>
                    </div>
                    <button className="admin-primary-button" type="submit" disabled={isSavingDoctor || hospitals.length === 0}>
                      {isSavingDoctor ? 'Adding...' : '➕ Add Doctor'}
                    </button>
                    {hospitals.length === 0 && <p className="admin-hint">Add a hospital before adding doctors.</p>}
                  </form>
                  {doctorMessage && (
                    <p className={`admin-alert ${doctorMessage.success ? 'success' : 'error'}`} role="status">
                      {doctorMessage.text}
                    </p>
                  )}
                </section>

                <section className="admin-card">
                  <h2>All Doctors</h2>
                  <div className="admin-table-wrap">
                    <table>
                      <thead><tr><th>ID</th><th>Name</th><th>Specialization</th><th>Hospital</th><th>Exp</th><th>Fee</th><th>Days</th><th>Timings</th><th>Actions</th></tr></thead>
                      <tbody>
                        {doctors.length === 0 ? (
                          <tr><td colSpan="9">No doctors yet.</td></tr>
                        ) : doctors.map((doctor) => (
                          <tr key={doctor.id}>
                            <td>{doctor.id}</td>
                            <td><strong>{doctor.name}</strong></td>
                            <td>{doctor.specialization}</td>
                            <td>{doctor.hospital?.name || '-'}</td>
                            <td>{doctor.experience}</td>
                            <td>{formatMoney(doctor.fee)}</td>
                            <td>{doctor.availableDays || ''}</td>
                            <td>{doctor.timings || ''}</td>
                            <td><button className="admin-delete-button" type="button" onClick={() => deleteDoctor(doctor)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            )}

            {activeTab === 'appointments' && (
              <section id="appointments-panel" className="admin-panel" role="tabpanel" aria-labelledby="appointments-tab">
                <section className="admin-card">
                  <h2>All Appointments</h2>
                  <div className="admin-table-wrap">
                    <table>
                      <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Hospital</th><th>Date</th><th>Time</th><th>Fee</th><th>Status</th></tr></thead>
                      <tbody>
                        {appointments.length === 0 ? (
                          <tr><td colSpan="8">No appointments yet.</td></tr>
                        ) : [...appointments].reverse().map((appointment) => (
                          <tr key={appointment.id}>
                            <td>{appointment.id}</td>
                            <td>{appointment.patient?.name || '-'}</td>
                            <td>{appointment.doctor?.name || '-'}</td>
                            <td>{appointment.doctor?.hospital?.name || '-'}</td>
                            <td>{appointment.appointmentDate}</td>
                            <td>{formatTime(appointment.appointmentTime)}</td>
                            <td>{formatMoney(appointment.fee)}</td>
                            <td><span className={`admin-badge ${appointment.status}`}>{appointment.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="register-footer">
        <strong>🏥 MediBook</strong> – Online Doctor Appointment System
      </footer>
    </div>
  )
}

export default Admin
