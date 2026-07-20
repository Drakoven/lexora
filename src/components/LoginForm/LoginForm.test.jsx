import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm onBack={() => {}} />
    </MemoryRouter>
  );
}

describe("LoginForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("affiche une erreur et n'appelle pas login si l'email est vide", async () => {
    const login = vi.fn();
    useAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse123");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Veuillez entrer votre email.");
    expect(login).not.toHaveBeenCalled();
  });

  it("affiche une erreur et n'appelle pas login si le mot de passe est vide", async () => {
    const login = vi.fn();
    useAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "test@lexora.fr");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Veuillez entrer votre mot de passe.");
    expect(login).not.toHaveBeenCalled();
  });

  it("appelle login avec les identifiants et navigue vers /dashboard en cas de succès", async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    useAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "test@lexora.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse123");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(login).toHaveBeenCalledWith({ email: "test@lexora.fr", password: "motdepasse123" });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("affiche le message d'erreur du serveur si login échoue et ne navigue pas", async () => {
    const login = vi.fn().mockRejectedValue(new Error("Identifiants invalides."));
    useAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "test@lexora.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "mauvais");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Identifiants invalides.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
