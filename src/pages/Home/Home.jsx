import "./Home.css";
import Hero from "../../components/Hero/Hero.jsx";
import Button from "../../components/Button/Button.jsx";
import LoginLink from "../../components/LoginLink/LoginLink.jsx";
import { useState } from "react";
import PlayMenu from "../../components/PlayMenu/PlayMenu.jsx";

function Home() {
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false);

  return (
    <div className="home">
      <Hero />

      <Button
        text="JOUER"
        onClick={() => setIsPlayMenuOpen(true)}
      />

      <LoginLink />

      {isPlayMenuOpen && <PlayMenu />}
    </div>
  );
}

export default Home;