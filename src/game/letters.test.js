import { describe, expect, it } from "vitest";
import {
  BLANK_COUNT,
  LETTER_COUNTS,
  LETTER_VALUES,
  createBag,
  drawTiles,
} from "./letters.js";

describe("createBag", () => {
  it("contient une tuile par lettre déclarée dans LETTER_COUNTS, plus les blancs", () => {
    const bag = createBag();
    const expectedLetterCount = Object.values(LETTER_COUNTS).reduce((a, b) => a + b, 0);
    expect(bag).toHaveLength(expectedLetterCount + BLANK_COUNT);
  });

  it("respecte le nombre exact de chaque lettre défini dans LETTER_COUNTS", () => {
    const bag = createBag();
    for (const [letter, count] of Object.entries(LETTER_COUNTS)) {
      const actual = bag.filter((tile) => tile.letter === letter && !tile.isBlank).length;
      expect(actual).toBe(count);
    }
  });

  it("contient exactement 2 tuiles blanches", () => {
    const bag = createBag();
    const blanks = bag.filter((tile) => tile.isBlank);
    expect(blanks).toHaveLength(BLANK_COUNT);
    expect(blanks.every((tile) => tile.letter === null)).toBe(true);
  });

  it("mélange réellement l'ordre (pas juste un artefact statistique)", () => {
    // Le mélange est aléatoire donc pas garanti à 100%, mais la probabilité
    // que 2 tirages de 100 tuiles ressortent dans le même ordre est
    // astronomiquement faible — un vrai signal si ce test échoue un jour.
    const bagA = createBag().map((t) => t.letter);
    const bagB = createBag().map((t) => t.letter);
    expect(bagA).not.toEqual(bagB);
  });

  it("chaque lettre a une valeur définie dans LETTER_VALUES", () => {
    const bag = createBag();
    for (const tile of bag) {
      if (!tile.isBlank) {
        expect(LETTER_VALUES[tile.letter]).toBeGreaterThan(0);
      }
    }
  });
});

describe("drawTiles", () => {
  it("pioche le nombre demandé depuis le début du sac", () => {
    const bag = [{ letter: "A" }, { letter: "B" }, { letter: "C" }, { letter: "D" }];
    const { drawn, remaining } = drawTiles(bag, 2);
    expect(drawn).toEqual([{ letter: "A" }, { letter: "B" }]);
    expect(remaining).toEqual([{ letter: "C" }, { letter: "D" }]);
  });

  it("ne modifie pas le sac original (pure, pas de mutation)", () => {
    const bag = [{ letter: "A" }, { letter: "B" }];
    const originalLength = bag.length;
    drawTiles(bag, 1);
    expect(bag).toHaveLength(originalLength);
  });

  it("pioche moins que demandé si le sac n'a pas assez de tuiles", () => {
    const bag = [{ letter: "A" }];
    const { drawn, remaining } = drawTiles(bag, 5);
    expect(drawn).toHaveLength(1);
    expect(remaining).toHaveLength(0);
  });

  it("gère une pioche de 0 tuile", () => {
    const bag = [{ letter: "A" }, { letter: "B" }];
    const { drawn, remaining } = drawTiles(bag, 0);
    expect(drawn).toHaveLength(0);
    expect(remaining).toHaveLength(2);
  });
});
