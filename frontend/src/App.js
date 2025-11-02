
"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from "./components/Login"
import Register from "./components/Register"
import MyProfile from "./components/MyProfile"
import Attendance from "./components/Attendance"
import ProtectedRoute from "./components/ProtectedRoute";

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
  }

  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded px-3 mt-3">
          <Link className="navbar-brand" to={token ? "/myprofile" : "/login"}>Attendance App</Link>
          <div className="collapse navbar-collapse">
            <div className="navbar-nav ms-auto">
              {token ? (
                <>
                  <Link className="nav-link" to="/myprofile">
                    My Profile
                  </Link>
                  <Link className="nav-link" to="/attendance">
                    Attendance
                  </Link>
                  <Link className="nav-link" to="/login" onClick={handleLogout}>
                    Logout
                  </Link>
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
            </div>
          </div>
        </nav>
        
        <div className="mt-4">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setToken={setToken} />} />
              
              <Route 
                path="/myprofile" 
                element={
                  <ProtectedRoute isAuthenticated={!!token} component={<MyProfile />} />
                } 
              />
              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute isAuthenticated={!!token} component={<Attendance />} />
                } 
              />

              <Route path="/" element={<Navigate to={token ? "/myprofile" : "/login"} />} />
            </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
