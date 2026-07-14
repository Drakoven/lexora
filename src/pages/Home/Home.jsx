import "./Home.css";
import Hero from "../../components/Hero/Hero.jsx";
import Button from "../../components/Button/Button.jsx";
import LoginLink from "../../components/LoginLink/LoginLink.jsx";

function Home() {
  return (
    <div className="home">
      <Hero />
      <Button text="JOUER" />
      <LoginLink />
    </div>
  );
}

export default Home;