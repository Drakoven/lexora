import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm onBack={() => {}} />
    </MemoryRouter>
  );
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText("Pseudo"), "joueur1");
  await user.type(screen.getByLabelText("Email"), "joueur1@lexora.fr");
  await user.type(screen.getByLabelText("Mot de passe"), "motdepasse123");
  await user.type(screen.getByLabelText("Confirmer le mot de passe"), "motdepasse123");
}

describe("RegisterForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("affiche une erreur si un champ requis est vide, sans appeler register", async () => {
    const register = vi.fn();
    useAuth.mockReturnValue({ register });
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText("Email"), "joueur1@lexora.fr");
    await user.click(screen.getByRole("button", { name: "Créer un compte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Tous les champs sont requis.");
    expect(register).not.toHaveBeenCalled();
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    const register = vi.fn();
    useAuth.mockReturnValue({ register });
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText("Pseudo"), "joueur1");
    await user.type(screen.getByLabelText("Email"), "joueur1@lexora.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse123");
    await user.type(screen.getByLabelText("Confirmer le mot de passe"), "autrechose");
    await user.click(screen.getByRole("button", { name: "Créer un compte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Les mots de passe ne correspondent pas."
    );
    expect(register).not.toHaveBeenCalled();
  });

  it("appelle register avec les bons champs et navigue vers /dashboard en cas de succès", async () => {
    const register = vi.fn().mockResolvedValue({ id: 1 });
    useAuth.mockReturnValue({ register });
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Créer un compte" }));

    expect(register).toHaveBeenCalledWith({
      username: "joueur1",
      email: "joueur1@lexora.fr",
      password: "motdepasse123",
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("affiche le message d'erreur du serveur si register échoue et ne navigue pas", async () => {
    const register = vi.fn().mockRejectedValue(new Error("Ce pseudo ou cet email est déjà utilisé."));
    useAuth.mockReturnValue({ register });
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Créer un compte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ce pseudo ou cet email est déjà utilisé."
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("propose des liens vers les CGU et la politique de confidentialité", () => {
    useAuth.mockReturnValue({ register: vi.fn() });
    renderRegisterForm();

    expect(screen.getByRole("link", { name: "conditions générales d'utilisation" })).toHaveAttribute(
      "href",
      "/conditions-utilisation"
    );
    expect(screen.getByRole("link", { name: "politique de confidentialité" })).toHaveAttribute(
      "href",
      "/politique-de-confidentialite"
    );
  });
});
