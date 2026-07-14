import { Link } from "react-router-dom";
import "./LoginLink.css";

function LoginLink() {
  return (
    <div className="login-link-container">
        <p className="login-text">Déjà un compte ?</p>

        <Link to="/login" className="login-link">
            Se connecter
        </Link>
    </div>
  );
}

export default LoginLink;