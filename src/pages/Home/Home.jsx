import Hero from "../../components/Hero/Hero.jsx";
import Button from "../../components/Button/Button.jsx";

function Home() {
  return (
    <div>
      <Hero />
      <Button text="JOUER" />
      <Button text="SE CONNECTER" />
      <Button text="CRÉER UN COMPTE" />
      <Button text="REJOUER" />
    </div>
  );
}

export default Home;