import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

const APPOINTMENT_SLOTS = Array.from({ length: 18 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}).filter((time) => !time.startsWith('13:'))

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
    throw new Error((typeof data === 'string' ? data : data?.message) || 'Request failed.')
  }
  return data
}

function getStoredUser() {
  try {
    const user = window.localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return `${(hours + 11) % 12 + 1}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function AdminNav() {
  return (
    <nav className="register-nav" aria-label="Main navigation">
      <Link className="register-logo" to="/register">🏥 MediBook</Link>
      <div className="register-nav-links">
        <Link to="/register">Home</Link>
        <Link to="/admin">Admin</Link>
      </div>
    </nav>
  )
}

function Book() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = getStoredUser()
  const doctorId = searchParams.get('doctorId')
  const [today] = useState(getToday)
  const [currentTime, setCurrentTime] = useState(getCurrentTime)
  const [doctor, setDoctor] = useState(null)
  const [doctorError, setDoctorError] = useState('')
  const [isDoctorLoading, setIsDoctorLoading] = useState(true)
  const [date, setDate] = useState('')
  const [slotRefresh, setSlotRefresh] = useState(0)
  const [bookedSlots, setBookedSlots] = useState([])
  const [slotsError, setSlotsError] = useState('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(getCurrentTime()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadDoctor() {
      setIsDoctorLoading(true)
      setDoctorError('')
      setDoctor(null)

      if (!doctorId) {
        if (isCurrent) {
          setDoctorError('No doctor was selected. Please choose a doctor first.')
          setIsDoctorLoading(false)
        }
        return
      }

      try {
        const doctors = await api('/api/doctors')
        const foundDoctor = doctors.find((item) => String(item.id) === doctorId)
        if (!isCurrent) return
        if (!foundDoctor) {
          setDoctorError('Doctor not found. Please choose another doctor.')
        } else {
          setDoctor(foundDoctor)
        }
      } catch (error) {
        if (isCurrent) {
          setDoctorError(error instanceof Error ? error.message : 'Unable to load doctor details.')
        }
      } finally {
        if (isCurrent) setIsDoctorLoading(false)
      }
    }

    loadDoctor()
    return () => {
      isCurrent = false
    }
  }, [doctorId])

  useEffect(() => {
    let isCurrent = true

    async function loadBookedSlots() {
      setBookedSlots([])
      setSlotsError('')

      if (!date || !doctor) {
        setIsLoadingSlots(false)
        return
      }

      setIsLoadingSlots(true)
      try {
        const times = await api(
          `/api/appointments/doctor/${doctor.id}/booked?date=${encodeURIComponent(date)}`,
        )
        if (isCurrent) {
          setBookedSlots(times.map((time) => String(time).slice(0, 5)))
        }
      } catch (error) {
        if (isCurrent) {
          setSlotsError(error instanceof Error ? error.message : 'Unable to load available slots.')
        }
      } finally {
        if (isCurrent) setIsLoadingSlots(false)
      }
    }

    loadBookedSlots()
    return () => {
      isCurrent = false
    }
  }, [date, doctor, slotRefresh])

  if (!user) return <Navigate to="/login" replace />

  function chooseDate(event) {
    setDate(event.target.value)
    setSelectedSlot('')
    setMessage('')
  }

  function isPastSlot(time) {
    if (date !== today) return false
    return time < currentTime
  }

  async function confirmBooking() {
    if (!doctor || !selectedSlot || !date) return

    setMessage('')
    setIsBooking(true)
    try {
      await api('/api/appointments', 'POST', {
        patientId: user.id,
        doctorId: doctor.id,
        appointmentDate: date,
        appointmentTime: selectedSlot,
      })
      setIsSuccess(true)
      setMessage('Appointment booked successfully! Redirecting...')
      window.setTimeout(() => {
        navigate('/my-appointments')
      }, 1300)
    } catch (error) {
      setIsSuccess(false)
      setMessage(error instanceof Error ? error.message : 'Unable to book appointment.')
      setSelectedSlot('')
      setSlotRefresh((current) => current + 1)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="register-page">
      <AdminNav />
      <header className="book-banner">
        <h1>📅 Book Appointment</h1>
        <p>Select a date and an available time slot</p>
      </header>

      <main className="book-container">
        <div className="book-layout">
          <section className="book-doctor-card" aria-label="Doctor information">
            {isDoctorLoading ? (
              <p role="status">Loading doctor details...</p>
            ) : doctorError ? (
              <div className="book-error" role="alert">
                <p>{doctorError}</p>
                <button type="button" onClick={() => navigate(-1)}>Go back</button>
              </div>
            ) : doctor ? (
              <>
                <div className="book-doctor-heading">
                  <div className="book-avatar" aria-hidden="true">
                    {doctor.name.replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2>{doctor.name}</h2>
                    <span className="book-specialization">{doctor.specialization}</span>
                  </div>
                </div>
                <p className="book-qualification">
                  🎓 {doctor.qualification || 'Qualification not specified'} • {doctor.experience} yrs experience
                </p>
                <div className="book-hospital-info">
                  <strong>🏥 {doctor.hospital?.name || '-'}</strong>
                  <span>📍 {doctor.hospital?.address || ''}{doctor.hospital?.city ? `, ${doctor.hospital.city}` : ''}</span>
                </div>
                <p className="book-detail">📞 {doctor.hospital?.phone || '-'}</p>
                <p className="book-detail">📅 {doctor.availableDays || 'Availability not specified'}</p>
                <p className="book-detail">⏰ {doctor.timings || 'Timings not specified'}</p>
                <div className="book-fee">
                  <span>Consultation Fee</span>
                  <strong>{formatMoney(doctor.fee)}</strong>
                </div>
              </>
            ) : null}
          </section>

          <section className="book-card" aria-labelledby="book-date-heading">
            <h2 id="book-date-heading">Choose Date &amp; Time</h2>
            <label htmlFor="appointment-date">Appointment Date</label>
            <input
              id="appointment-date"
              type="date"
              min={today}
              value={date}
              onChange={chooseDate}
              disabled={!doctor || isDoctorLoading}
            />

            <div className="book-slot-label">
              <strong>Available Slots</strong>
              <span>(greyed out = already booked or past)</span>
            </div>

            {isLoadingSlots ? (
              <p className="book-slot-note" role="status">Checking available slots...</p>
            ) : slotsError ? (
              <p className="book-error" role="alert">{slotsError}</p>
            ) : !date ? (
              <p className="book-slot-note">Select a date to see slots</p>
            ) : (
              <div className="book-slots">
                {APPOINTMENT_SLOTS.map((slot) => {
                  const unavailable = bookedSlots.includes(slot) || isPastSlot(slot)
                  return (
                    <button
                      key={slot}
                      className={`book-slot ${selectedSlot === slot ? 'selected' : ''}`}
                      type="button"
                      disabled={unavailable}
                      aria-pressed={selectedSlot === slot}
                      onClick={() => {
                        setSelectedSlot(slot)
                        setMessage('')
                      }}
                    >
                      {formatTime(slot)}
                    </button>
                  )
                })}
              </div>
            )}

            {selectedSlot && doctor && (
              <div className="book-summary" aria-live="polite">
                ✅ {doctor.name} • {date} • {formatTime(selectedSlot)}
                <br />
                💰 Consultation fee: <strong>{formatMoney(doctor.fee)}</strong> (pay at the hospital)
              </div>
            )}

            <button
              className="register-button"
              type="button"
              disabled={!selectedSlot || !doctor || isBooking || isLoadingSlots}
              onClick={confirmBooking}
            >
              {isBooking ? 'Booking...' : 'Confirm Appointment'}
            </button>

            {message && (
              <p className={`register-message ${isSuccess ? 'success' : 'error'}`} role="status">
                {message}
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="register-footer">
        <strong>🏥 MediBook</strong> – Online Doctor Appointment System
      </footer>
    </div>
  )
}

export default Book
