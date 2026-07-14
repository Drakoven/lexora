import "./PlayMenu.css";
import Button from "../Button/Button.jsx";

function PlayMenu() {
  return ( 

    <section className="play-menu">
        <h2 className="play-menu-title">Comment souhaites-tu jouer ?</h2>

        <div className="play-menu-buttons">
            <Button text="Jouer en invité" />

            <Button text="Se connecter" />

            <Button text="Créer un compte" />
        </div>
    </section>
    );
}

export default PlayMenu;