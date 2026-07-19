import { useNavigate } from "react-router-dom";

import "./Login.css";
import LoginForm from "../../components/LoginForm/LoginForm.jsx";

function Login() {
  const navigate = useNavigate();

  return (
    <main className="login-page">
      <h1 className="visually-hidden">Connexion — Lexora</h1>
      <LoginForm onBack={() => navigate("/")} />
    </main>
  );
}

export default Login;
