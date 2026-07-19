import { Link } from "react-router-dom";

import "./ConditionsUtilisation.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";

function ConditionsUtilisation() {
  return (
    <AppLayout>
      <div className="legal-page">
        <h1>Conditions générales d'utilisation</h1>
        <p className="legal-updated">Dernière mise à jour : 19 juillet 2026</p>

        <section>
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et
            l'utilisation du site Lexora (https://lexora-jeu.fr), un jeu de lettres en ligne
            gratuit. En créant un compte ou en utilisant le site, tu acceptes sans réserve les
            présentes CGU.
          </p>
        </section>

        <section>
          <h2>2. Accès au service</h2>
          <p>
            Lexora est un projet personnel, gratuit et proposé « en l'état ». Le mode invité
            permet de jouer localement sans compte ; les fonctionnalités en ligne (parties
            asynchrones, classement, amis, badges) nécessitent la création d'un compte.
          </p>
          <p>
            Le service est fourni sans garantie de disponibilité continue. Des interruptions
            (maintenance, panne, évolution technique) peuvent survenir sans préavis.
          </p>
        </section>

        <section>
          <h2>3. Création de compte</h2>
          <ul>
            <li>Un compte par personne. Les comptes multiples destinés à fausser le classement, le système d'amis ou les statistiques sont interdits.</li>
            <li>Tu es responsable de la confidentialité de ton mot de passe et de toute activité effectuée depuis ton compte.</li>
            <li>Les informations fournies à l'inscription (pseudo, email) doivent être exactes.</li>
            <li>
              Conformément à la réglementation française, la création d'un compte par un mineur
              de moins de 15 ans nécessite l'autorisation d'un titulaire de l'autorité
              parentale.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Règles de bonne conduite</h2>
          <p>En utilisant Lexora, tu t'engages à :</p>
          <ul>
            <li>Ne pas tricher (usage d'outils externes pour générer des coups, exploitation de bugs pour fausser une partie ou le classement).</li>
            <li>Ne pas harceler, insulter ou importuner d'autres joueurs, y compris via les réactions rapides en partie.</li>
            <li>Ne pas tenter de perturber le fonctionnement du site (surcharge délibérée, contournement des limites techniques mises en place).</li>
          </ul>
          <p>
            Le bot d'entraînement ("Lexora Bot") est un adversaire proposé par le site lui-même
            et ne constitue pas une exception aux règles ci-dessus.
          </p>
        </section>

        <section>
          <h2>5. Suspension et suppression de compte</h2>
          <p>
            En cas de non-respect des présentes CGU, l'éditeur se réserve le droit de suspendre
            ou supprimer un compte, sans préavis pour les cas les plus graves. Tu peux
            également demander la suppression de ton propre compte à tout moment via{" "}
            <Link to="/settings">tes paramètres</Link> ou en écrivant à{" "}
            <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>.
          </p>
        </section>

        <section>
          <h2>6. Propriété intellectuelle</h2>
          <p>
            Le code, le design et le contenu du site sont la propriété de l'éditeur (voir les{" "}
            <Link to="/mentions-legales">mentions légales</Link>), sauf mention contraire. Le
            dictionnaire de mots utilisé pour valider les coups provient du projet Dicollecte,
            sous licence MPL 2.0.
          </p>
        </section>

        <section>
          <h2>7. Responsabilité</h2>
          <p>
            Le service est fourni « en l'état », sans garantie d'absence d'erreur (y compris
            dans le dictionnaire de validation des mots ou le calcul du classement). L'éditeur
            ne pourra être tenu responsable des dommages indirects résultant de l'utilisation
            ou de l'impossibilité d'utiliser le site.
          </p>
        </section>

        <section>
          <h2>8. Modification des CGU</h2>
          <p>
            Ces CGU peuvent être modifiées à tout moment pour refléter l'évolution du service.
            La date de dernière mise à jour en haut de cette page permet de suivre les
            changements. Il est recommandé de la consulter régulièrement.
          </p>
        </section>

        <section>
          <h2>9. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de
            résolution amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :{" "}
            <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

export default ConditionsUtilisation;
