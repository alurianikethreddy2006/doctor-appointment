import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function register(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Registration failed. Please try again.')
      }

      setIsSuccess(true)
      setMessage('Registered! Redirecting to login...')
      window.setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (error) {
      setIsSuccess(false)
      setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <nav className="register-nav" aria-label="Main navigation">
        <Link className="register-logo" to="/register">MediBook</Link>
        <div className="register-nav-links">
          <Link to="/register">Home</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <main className="register-wrap">
        <section className="register-card" aria-labelledby="registration-heading">
          <div className="register-side">
            <h2>Join MediBook 🩺</h2>
            <p>Create a free patient account in seconds.</p>
            <ul>
              <li>Book appointments 24x7</li>
              <li>View or cancel anytime</li>
              <li>No waiting in queues</li>
            </ul>
          </div>

          <form className="register-form" onSubmit={register}>
            <h1 id="registration-heading">Patient Registration</h1>

            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="register-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>

            {message && (
              <p className={`register-message ${isSuccess ? 'success' : 'error'}`} role="status">
                {message}
              </p>
            )}

            <p className="register-login-prompt">
              Already registered? <Link to="/login">Login</Link>
            </p>
          </form>
        </section>
      </main>

      <footer className="register-footer" />
    </div>
  )
}

export default Register
