import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Admin from './components/Admin.jsx'
import Book from './components/Book.jsx'
import Doctors from './components/Doctors.jsx'
import Home from './components/Home.jsx'
import Hospitals from './components/Hospitals.jsx'
import Login from './components/Login.jsx'
import MyAppointments from './components/MyAppointments.jsx'
import Register from './components/Register.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/book" element={<Book />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
