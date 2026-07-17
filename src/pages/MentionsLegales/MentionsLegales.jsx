import { Link } from "react-router-dom";

import "./MentionsLegales.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";

function MentionsLegales() {
  return (
    <AppLayout>
    <div className="legal-page">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site Lexora (https://lexora-jeu.fr) est édité par Florian Durozier, particulier
          n'exerçant pas d'activité commerciale dans le cadre de ce site.
        </p>
        <p>
          Contact : <a href="mailto:contact@lexora-jeu.fr">contact@lexora-jeu.fr</a>
        </p>
        <p>
          Conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 pour la
          confiance dans l'économie numérique, l'éditeur, personne physique agissant à titre
          non professionnel, n'est pas tenu de rendre publiques ses coordonnées complètes ;
          celles-ci sont communiquées à l'hébergeur et peuvent être transmises à l'autorité
          judiciaire sur demande.
        </p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>Florian Durozier</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par O2Switch. Les coordonnées complètes de l'hébergeur
          (raison sociale, adresse, téléphone) sont disponibles sur{" "}
          <a href="https://www.o2switch.fr" target="_blank" rel="noreferrer">
            o2switch.fr
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus du site (textes, graphismes, logo, structure) est la
          propriété de Florian Durozier, sauf mention contraire. Toute reproduction sans
          autorisation préalable est interdite.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles collectées sur ce site est détaillé dans
          notre <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.
        </p>
      </section>
    </div>
    </AppLayout>
  );
}

export default MentionsLegales;
