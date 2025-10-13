"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import MyProfile from "./components/MyProfile"
import Attendance from "./components/Attendance"

function App() {
  const [token, setToken] = useState(null)
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])
  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <Router>
      <div className="container w-100 h-100">
        <nav className="nav mt-3 mb-3">
          {token ? (
            <>
              <Link className="nav-link" to="/myprofile">
                My Profile
              </Link>
              <Link className="nav-link" to="/attendance">
                Attendance
              </Link>
              <button className="nav-link btn btn-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/register">
                Register
              </Link>
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </>
          )}
        </nav>
        <hr />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/" element={<Login setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  )
}
export default App
