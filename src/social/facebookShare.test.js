import { afterEach, describe, expect, it, vi } from "vitest";
import { shareOnFacebook } from "./facebookShare.js";

describe("shareOnFacebook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ouvre sharer.php avec l'URL encodée en paramètre u", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    shareOnFacebook({ url: "https://lexora-jeu.fr/" });

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [calledUrl] = openSpy.mock.calls[0];
    expect(calledUrl).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flexora-jeu.fr%2F"
    );
  });

  it("inclut le paramètre quote quand il est fourni", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    shareOnFacebook({ url: "https://lexora-jeu.fr/", quote: "Viens jouer !" });

    const [calledUrl] = openSpy.mock.calls[0];
    const params = new URL(calledUrl).searchParams;
    expect(params.get("u")).toBe("https://lexora-jeu.fr/");
    expect(params.get("quote")).toBe("Viens jouer !");
  });

  it("omet le paramètre quote quand il n'est pas fourni", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    shareOnFacebook({ url: "https://lexora-jeu.fr/" });

    const [calledUrl] = openSpy.mock.calls[0];
    expect(new URL(calledUrl).searchParams.has("quote")).toBe(false);
  });

  it("ouvre une popup nommée sans opener ni referrer", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    shareOnFacebook({ url: "https://lexora-jeu.fr/" });

    const [, target, features] = openSpy.mock.calls[0];
    expect(target).toBe("facebook-share");
    expect(features).toContain("noopener");
    expect(features).toContain("noreferrer");
  });
});
