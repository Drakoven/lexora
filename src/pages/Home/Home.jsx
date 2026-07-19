import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Home.css";
import Hero from "../../components/Hero/Hero.jsx";
import Button from "../../components/Button/Button.jsx";
import LoginLink from "../../components/LoginLink/LoginLink.jsx";
import PlayMenu from "../../components/PlayMenu/PlayMenu.jsx";
import Overlay from "../../components/Overlay/Overlay.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import LoginForm from "../../components/LoginForm/LoginForm.jsx";
import RegisterForm from "../../components/RegisterForm/RegisterForm.jsx";

function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState("play");

  return (
    <div className="home">
      <main>
        <Hero />

        <Button
          text="JOUER"
          onClick={() => {
            setCurrentModal("play");
            setIsModalOpen(true);
          }}
        />

        <LoginLink />

        {isModalOpen && (
          <>
            <Overlay onClick={() => setIsModalOpen(false)} />

            <Modal>
              {currentModal === "play" && (
                <PlayMenu
                  onGuest={() => navigate("/game")}
                  onLogin={() => setCurrentModal("login")}
                  onRegister={() => setCurrentModal("register")}
                />
              )}
              {currentModal === "login" && <LoginForm onBack={() => setCurrentModal("play")} />}
              {currentModal === "register" && <RegisterForm onBack={() => setCurrentModal("play")} />}
            </Modal>
          </>
        )}
      </main>

      <footer className="home-footer">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/politique-de-confidentialite">Politique de confidentialité</Link>
      </footer>
    </div>
  );
}

export default Home;