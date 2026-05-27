import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [avgScore, setAvgScore] = useState(0);

  const API = import.meta.env.VITE_API_URL;

  // =========================
  // LOAD DATA
  // =========================
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const userRes = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviewRes = await axios.get(`${API}/admin/interviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(userRes.data.users);
      setInterviews(interviewRes.data.interviews);

      // AVG SCORE CALC
      const total = interviewRes.data.interviews.reduce(
        (sum, i) => sum + i.score,
        0
      );

      setAvgScore(
        interviewRes.data.interviews.length
          ? (total / interviewRes.data.interviews.length).toFixed(2)
          : 0
      );
    } catch (err) {
      console.log(err);
      alert("Admin access denied or backend error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // PDF DOWNLOAD
  // =========================
  const downloadPDF = (email) => {
    window.open(`${API}/download-report/${email}`, "_blank");
  };

  return (
    <div className="admin-container">

      <h1>Admin Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">
          <h2>Total Users</h2>
          <p>{users.length}</p>
        </div>

        <div className="card">
          <h2>Average Score</h2>
          <p>{avgScore}</p>
        </div>
      </div>

      {/* USERS TABLE */}
      <h2>Users</h2>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.id}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* INTERVIEW TABLE */}
      <h2>Interviews</h2>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Email</th>
            <th>Score</th>
            <th>Performance</th>
            <th>Suggestion</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {interviews.map((i, index) => (
            <tr key={index}>
              <td>{i.email}</td>
              <td>{i.score}</td>
              <td>{i.performance}</td>
              <td>{i.suggestion}</td>
              <td>
                <button onClick={() => downloadPDF(i.email)}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default AdminDashboard;