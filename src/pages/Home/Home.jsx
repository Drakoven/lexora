import { useState } from "react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState("play");

  return (
    <div className="home">
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
                onGuest={() => setCurrentModal("guest")}
                onLogin={() => setCurrentModal("login")}
                onRegister={() => setCurrentModal("register")}
              />
      )}
            {currentModal === "login" && <LoginForm onBack={() => setCurrentModal("play")} />}
            {currentModal === "register" && <RegisterForm onBack={() => setCurrentModal("play")} />}
          </Modal>
        </>
      )}
    </div>
  );
}

export default Home;