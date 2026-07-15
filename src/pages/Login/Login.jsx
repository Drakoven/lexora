import { useNavigate } from "react-router-dom";

import "./Login.css";
import LoginForm from "../../components/LoginForm/LoginForm.jsx";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <LoginForm onBack={() => navigate("/")} />
    </div>
  );
}

export default Login;
