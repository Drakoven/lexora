import "./PlayMenu.css";
import Button from "../Button/Button.jsx";

function PlayMenu({ onGuest, onLogin, onRegister }) {
  return ( 

    <section className="play-menu">
        <h2 className="play-menu-title">Comment souhaites-tu jouer ?</h2>

        <div className="play-menu-buttons">
            <Button text="Jouer en invité" onClick={onGuest} />

            <Button text="Se connecter" onClick={onLogin} />

            <Button text="Créer un compte" onClick={onRegister} />
        </div>
    </section>
    );
}

export default PlayMenu;