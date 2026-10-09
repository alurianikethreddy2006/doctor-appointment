import { Link, useLocation, useNavigate } from 'react-router-dom'

function getUser() {
  try {
    const storedUser = window.localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function SiteNav() {
  const user = getUser()
  const location = useLocation()
  const navigate = useNavigate()

  function logout() {
    window.localStorage.removeItem('user')
    navigate('/login')
  }

  const links = [
    { to: '/', label: 'Home', active: location.pathname === '/' },
    { to: '/hospitals', label: 'Hospitals', active: location.pathname === '/hospitals' },
    { to: '/doctors', label: 'Doctors', active: location.pathname === '/doctors' },
    ...(user?.role === 'ADMIN'
      ? [{ to: '/admin', label: '⚙️ Admin Panel', active: location.pathname === '/admin' }]
      : user
        ? [{ to: '/my-appointments', label: 'My Appointments', active: location.pathname === '/my-appointments' }]
        : []),
  ]

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link className="site-nav-logo" to="/">🏥 MediBook</Link>
      {links.map((link) => (
        <Link
          key={link.to}
          className={`site-nav-link ${link.active ? 'active' : ''}`}
          to={link.to}
        >
          {link.label}
        </Link>
      ))}
      <span className="site-nav-spacer" />
      {user ? (
        <>
          <span className="site-nav-greeting">Hi, {user.name}</span>
          <button className="site-nav-button" type="button" onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link className="site-nav-link" to="/login">Login</Link>
          <Link className="site-nav-button primary" to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}

export default SiteNav
