import "./CommentJouer.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import { LETTER_VALUES } from "../../game/letters.js";

const LETTER_ORDER = Object.keys(LETTER_VALUES);

function CommentJouer() {
  return (
    <AppLayout>
    <div className="howto-page">
      <h1>Comment jouer ?</h1>

      <section>
        <h2>Le but du jeu</h2>
        <p>
          Forme des mots sur le plateau en utilisant tes lettres, en profitant des cases bonus
          et des mots déjà posés. Le joueur avec le plus de points quand la partie se termine
          gagne.
        </p>
      </section>

      <section>
        <h2>Le premier mot</h2>
        <p>
          Le tout premier mot de la partie doit obligatoirement passer par la case centrale et
          contenir au moins 2 lettres.
        </p>
      </section>

      <section>
        <h2>Les mots suivants</h2>
        <p>
          Chaque nouveau mot doit toucher au moins une lettre déjà présente sur le plateau — soit
          en le prolongeant, soit en formant un mot perpendiculaire à un mot existant. Toutes les
          lettres posées doivent être alignées sur une même ligne ou une même colonne, sans trou.
        </p>
      </section>

      <section>
        <h2>Les cases bonus</h2>
        <p>Elles ne comptent que pour une lettre qui vient d'être posée dessus — pas pour un mot déjà en place.</p>
        <ul className="howto-bonus-list">
          <li><span className="howto-bonus-tag howto-bonus-dl">DL</span> Double la valeur de la lettre.</li>
          <li><span className="howto-bonus-tag howto-bonus-tl">TL</span> Triple la valeur de la lettre.</li>
          <li><span className="howto-bonus-tag howto-bonus-dw">DW</span> Double le score du mot entier.</li>
          <li><span className="howto-bonus-tag howto-bonus-tw">TW</span> Triple le score du mot entier.</li>
        </ul>
      </section>

      <section>
        <h2>Le joker</h2>
        <p>
          La tuile joker (blanc) remplace n'importe quelle lettre au moment où tu la poses, mais
          elle rapporte toujours 0 point — même sur une case bonus.
        </p>
      </section>

      <section>
        <h2>Le scrabble (bingo)</h2>
        <p>
          Utiliser tes 7 lettres en un seul coup rapporte un bonus de <strong>+50 points</strong>,
          en plus du score normal du mot.
        </p>
      </section>

      <section>
        <h2>À ton tour</h2>
        <p>Trois choix possibles :</p>
        <ul>
          <li><strong>Poser un mot</strong> valide relié au plateau.</li>
          <li><strong>Échanger</strong> une ou plusieurs lettres contre de nouvelles piochées dans le sac.</li>
          <li><strong>Passer</strong> ton tour sans rien faire.</li>
        </ul>
      </section>

      <section>
        <h2>Fin de partie</h2>
        <p>
          La partie se termine quand un joueur pose sa dernière lettre alors que le sac est vide,
          ou après 4 passes consécutives. En partie locale, chaque tour dure 90 secondes ; en
          ligne, tu as jusqu'à 48h pour jouer ton coup avant que ton adversaire puisse réclamer
          la victoire.
        </p>
      </section>

      <section>
        <h2>Les modes de jeu</h2>
        <ul>
          <li><strong>Partie locale</strong> — deux joueurs à tour de rôle sur le même appareil, sans compte requis.</li>
          <li><strong>Créer/rejoindre une salle</strong> — affronte un ami grâce à un code à partager, partie amicale.</li>
          <li><strong>Inviter un ami</strong> — envoie une invitation directe depuis ta liste d'amis.</li>
          <li><strong>Trouver une partie</strong> — matchmaking aléatoire, cette partie compte pour ton classement.</li>
          <li><strong>Jouer contre le bot</strong> — idéal pour t'entraîner, ne compte pas pour ton classement.</li>
        </ul>
      </section>

      <section>
        <h2>Valeur des lettres</h2>
        <div className="howto-letters-grid">
          {LETTER_ORDER.map((letter) => (
            <span key={letter} className="howto-letter-tile">
              {letter}
              <sub>{LETTER_VALUES[letter]}</sub>
            </span>
          ))}
        </div>
      </section>
    </div>
    </AppLayout>
  );
}

export default CommentJouer;
