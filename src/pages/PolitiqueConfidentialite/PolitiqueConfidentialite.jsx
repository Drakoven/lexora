import "./PolitiqueConfidentialite.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";

function PolitiqueConfidentialite() {
  return (
    <AppLayout>
    <div className="legal-page">
      <h1>Politique de confidentialité</h1>
      <p className="legal-updated">Dernière mise à jour : 17 juillet 2026</p>

      <section>
        <h2>Responsable du traitement</h2>
        <p>
          Florian Durozier — <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>À l'inscription : pseudo, adresse email, mot de passe (jamais stocké en clair)</li>
          <li>
            Utilisation du jeu : avatar choisi, statistiques (parties jouées, victoires,
            défaites, classement, badges), historique des coups en partie en ligne, liste
            d'amis
          </li>
          <li>
            Techniques : un cookie de session strictement nécessaire pour rester connecté
          </li>
        </ul>
      </section>

      <section>
        <h2>Finalités</h2>
        <ul>
          <li>Création et gestion du compte utilisateur</li>
          <li>Fonctionnement du jeu (parties, classement, amis, badges)</li>
          <li>Sécurité du service (protection contre les accès non autorisés)</li>
        </ul>
      </section>

      <section>
        <h2>Base légale</h2>
        <p>
          Le traitement de ces données repose sur l'exécution du contrat : elles sont
          nécessaires au fonctionnement du service que tu utilises en créant un compte.
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Tes données sont conservées tant que ton compte reste actif. Tu peux demander la
          suppression de ton compte et de l'ensemble de tes données à tout moment en nous
          contactant à <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>.
        </p>
      </section>

      <section>
        <h2>Destinataires des données</h2>
        <p>
          Les données sont hébergées par O2Switch (hébergeur du site, France) et ne sont
          transmises à aucun tiers commercial. Aucune donnée n'est vendue ni utilisée à des
          fins publicitaires.
        </p>
      </section>

      <section>
        <h2>Sécurité</h2>
        <p>
          Les mots de passe sont chiffrés (hashage bcrypt) et ne sont jamais stockés en
          clair. Les échanges avec le site s'effectuent en HTTPS.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site utilise uniquement un cookie de session strictement nécessaire au
          fonctionnement (maintien de la connexion). Aucun cookie de suivi publicitaire ou
          d'analyse n'est utilisé.
        </p>
      </section>

      <section>
        <h2>Tes droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), tu
          disposes d'un droit d'accès, de rectification, d'effacement, de portabilité et
          d'opposition concernant tes données personnelles. Pour exercer ces droits,
          contacte-nous à <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>.
        </p>
        <p>
          Tu peux également introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
            CNIL
          </a>{" "}
          si tu estimes que tes droits ne sont pas respectés.
        </p>
      </section>
    </div>
    </AppLayout>
  );
}

export default PolitiqueConfidentialite;
