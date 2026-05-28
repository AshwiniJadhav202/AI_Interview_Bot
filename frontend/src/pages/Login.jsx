import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const loginUser = async () => {
    try {
      const res = await axios.post(
  "https://ai-interview-bot-e1ue.onrender.com/save_login",
  {
    email,
    password,
  }
);

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ SAFE ROLE EXTRACTION (FIX)
      const role = res.data?.role || res.data?.data?.role;

      const token = res.data?.token || res.data?.data?.token;

      if (!role) {
        alert("Backend not returning role (check backend /save_login)");
        console.log("DEBUG RESPONSE:", res.data);
        return;
      }

      // store data safely
      localStorage.setItem("token", token || "");
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      // ROLE BASED NAVIGATION FIXED
      if (role === "admin") {
        navigate("/admin");     // ✅ ADMIN DASHBOARD
      } else {
        navigate("/interview"); // ✅ USER INTERVIEW
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      alert("Backend not connected / API error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AI Interview Bot</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={loginUser} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;