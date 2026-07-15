import "./RegisterForm.css";

function RegisterForm({ onBack }) {
  return (
    <section className="register-form">
      <button className="back-button" onClick={onBack}>
        ← Retour
      </button>

      <h2 className="register-form-title">Créer un compte</h2>

      <p>Le formulaire d'inscription arrivera ici.</p>

    </section>
  );
}

export default RegisterForm;