import { useNavigate } from "react-router-dom";

import "./Register.css";
import RegisterForm from "../../components/RegisterForm/RegisterForm.jsx";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <RegisterForm onBack={() => navigate("/")} />
    </div>
  );
}

export default Register;
