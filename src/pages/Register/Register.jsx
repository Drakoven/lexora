import { useNavigate } from "react-router-dom";

import "./Register.css";
import RegisterForm from "../../components/RegisterForm/RegisterForm.jsx";

function Register() {
  const navigate = useNavigate();

  return (
    <main className="register-page">
      <h1 className="visually-hidden">Créer un compte — Lexora</h1>
      <RegisterForm onBack={() => navigate("/")} />
    </main>
  );
}

export default Register;
