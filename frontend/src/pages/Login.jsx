import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const loginUser = async () => {

    try {

      await axios.post(
        "http://127.0.0.1:8000/save_login",
        {
          email,
          password
        }
      );

      localStorage.setItem("email", email);

      navigate("/interview");

    } catch (err) {

      alert("Backend not connected");
    }
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <h1 className="login-title">
          AI Interview Bot
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="login-btn"
          onClick={loginUser}
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;