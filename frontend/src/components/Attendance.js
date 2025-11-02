"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function Attendance() {
  const [role, setRole] = useState(null)
  const [history, setHistory] = useState([])
  const [team, setTeam] = useState([])
  const [allData, setAllData] = useState([])
  const [summary, setSummary] = useState([])
  const [logs, setLogs] = useState([])
  const [statusInput, setStatusInput] = useState("present")
  const [rectifyId, setRectifyId] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await axios.get("/myprofile", { headers: authHeader })
        setRole(res.data.role || "user")
      } catch (e) {
        setRole("user")
      }
    }
    getProfile()
  }, [])

  async function mark() {
    try {
      const res = await axios.post("/attendance/mark", {}, { headers: authHeader })
      alert(res.data.message || "marked")
    } catch (e) {
      alert(e.response?.data?.message || "failed")
    }
  }
  async function loadHistory() {
    try {
      const res = await axios.get("/attendance/history", { headers: authHeader })
      setHistory(res.data.attendance || [])
    } catch {}
  }
  async function loadTeam() {
    try {
      const res = await axios.get("/attendance/team", { headers: authHeader })
      setTeam(res.data.attendance || [])
    } catch {}
  }
  async function loadAll() {
    try {
      const res = await axios.get("/attendance/all", { headers: authHeader })
      setAllData(res.data.attendance || [])
    } catch {}
  }
  async function loadSummary() {
    try {
      const res = await axios.get("/attendance/summary", { headers: authHeader })
      setSummary(res.data.summary || [])
    } catch {}
  }
  async function loadLogs() {
    try {
      const res = await axios.get("/attendance/auditlogs", { headers: authHeader })
      setLogs(res.data.auditLogs || [])
    } catch {}
  }
  async function rectify() {
    if (!rectifyId) return alert("enter id")
    try {
      const res = await axios.put(`/attendance/rectify/${rectifyId}`, { status: statusInput }, { headers: authHeader })
      alert(res.data.message || "rectified")
    } catch (e) {
      alert(e.response?.data?.message || "failed")
    }
  }

  return (
    <div className="container mt-4">
      <h3>Attendance</h3>
      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={mark}>
          Mark Today
        </button>
        <button className="btn btn-secondary me-2" onClick={loadHistory}>
          My History
        </button>
        <button className="btn btn-outline-secondary me-2" onClick={loadSummary}>
          Summary
        </button>
        {(role === "manager" || role === "admin") && (
          <button className="btn btn-outline-primary me-2" onClick={loadTeam}>
            Team
          </button>
        )}
        {role === "admin" && (
          <>
            <button className="btn btn-outline-danger me-2" onClick={loadAll}>
              All
            </button>
            <button className="btn btn-outline-dark me-2" onClick={loadLogs}>
              Audit Logs
            </button>
          </>
        )}
      </div>

      {(role === "manager" || role === "admin") && (
        <div className="mb-4">
          <div className="row g-2">
            <div className="col">
              <input
                className="form-control"
                placeholder="attendance id"
                value={rectifyId}
                onChange={(e) => setRectifyId(e.target.value)}
              />
            </div>
            <div className="col">
              <select className="form-select" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                <option value="present">present</option>
                <option value="absent">absent</option>
                <option value="on_leave">on_leave</option>
              </select>
            </div>
            <div className="col">
              <button className="btn btn-warning" onClick={rectify}>
                Rectify
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <h5>My History</h5>
          <ul className="list-group">
            {history.map((h) => (
              <li key={h._id} className="list-group-item">
                <div>
                  <b>Date:</b> {new Date(h.date).toLocaleDateString()}
                </div>
                <div>
                  <b>Status:</b> {h.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h5>Summary</h5>
          <ul className="list-group">
            {summary.map((s) => (
              <li key={s._id} className="list-group-item">
                <b>{s._id}</b>: {s.count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(role === "manager" || role === "admin") && (
        <>
          <h5 className="mt-4">Team Attendance</h5>
          <ul className="list-group">
            {team.map((t) => (
              <li key={t._id} className="list-group-item">
                <div>
                  <b>User:</b> {t.user?.username || t.user}
                </div>
                <div>
                  <b>Date:</b> {new Date(t.date).toLocaleDateString()}
                </div>
                <div>
                  <b>Status:</b> {t.status}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {role === "admin" && (
        <>
          <h5 className="mt-4">All Attendance</h5>
          <ul className="list-group">
            {allData.map((a) => (
              <li key={a._id} className="list-group-item">
                <div>
                  <b>User:</b> {a.user?.username || a.user}
                </div>
                <div>
                  <b>Date:</b> {new Date(a.date).toLocaleDateString()}
                </div>
                <div>
                  <b>Status:</b> {a.status}
                </div>
              </li>
            ))}
          </ul>

          <h5 className="mt-4">Audit Logs</h5>
          <ul className="list-group">
            {logs.map((l) => (
              <li key={l._id} className="list-group-item">
                <div>
                  <b>Action:</b> {l.action}
                </div>
                <div>
                  <b>Old:</b> {l.oldStatus || "-"}
                </div>
                <div>
                  <b>New:</b> {l.newStatus || "-"}
                </div>
                <div>
                  <b>Date:</b> {new Date(l.changeDate).toLocaleString()}
                </div>
                <div>
                  <b>By:</b> {l.changedBy?.username || l.changedBy}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
