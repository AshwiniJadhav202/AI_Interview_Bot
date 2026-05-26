import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const API = import.meta.env.VITE_API_URL;

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      const response = await axios.post(
        `${API}/save_login`,
        {
          email,
          password
        }
      );

      alert(response.data.message);

      navigate("/interview");

    } catch (error) {

      console.log(error);

      alert("Backend not connected");
    }
  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>AI Interview System</h1>

        <p className="login-subtitle">
          Smart AI Powered Mock Interview Platform
        </p>

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

        <button onClick={handleLogin}>
          Login
        </button>

      </div>

    </div>
  );
};

export default Login;