

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function login(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const user = await api('/api/users/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })

      if (!user || typeof user !== 'object' || !user.role) {
        throw new Error('The server response is missing user information.')
      }

      window.localStorage.setItem('user', JSON.stringify(user))
      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/hospitals')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed. Please try again.')
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
          <Link to="/register">Create account</Link>
        </div>
      </nav>

      <main className="register-wrap">
        <section className="register-card" aria-labelledby="login-heading">
          <div className="register-side">
            <h2>Welcome Back! 👋</h2>
            <p>Login to book and manage your doctor appointments.</p>
            <ul>
              <li>Top hospitals &amp; specialists</li>
              <li>Clear consultation fees</li>
              <li>Instant slot booking</li>
            </ul>
          </div>

          <form className="register-form" onSubmit={login}>
            <h1 id="login-heading">Login</h1>

            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="register-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {message && (
              <p className="register-message error" role="alert">
                {message}
              </p>
            )}

            <p className="register-login-prompt">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </section>
      </main>

      <footer className="register-footer" />
    </div>
  )
}

export default Login
