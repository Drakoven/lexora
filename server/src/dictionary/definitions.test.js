import { describe, it, expect } from "vitest";
import { extractDefinitions } from "./definitions.js";

// Extrait réel (raccourci) de la page "chat" sur fr.wiktionary.org, utilisé
// comme fixture plutôt que d'appeler le vrai Wiktionary dans les tests.
const CHAT_WIKITEXT = `{{voir/chat}}

== {{langue|fr}} ==
=== {{S|étymologie}} ===
: {{laé|fr|nom|1}} {{siècle|lang=fr|XII}} Du {{étyl|frm|fr|chat}}.

=== {{S|nom|fr|num=1}} ===
{{fr-rég|ʃa|pron2=ʃɑ}}
'''chat''' {{pron|ʃa|ʃɑ|fr}} {{m}}
# {{félins|fr}} [[mammifère|Mammifère]] [[carnivore]] de taille moyenne.
#* {{exemple | lang=fr | Des '''chats''' erraient dans la rue. | source=Test}}
# (en particulier) Individu mâle de cet animal.
#: Note : on dit chatte pour la femelle.

== {{langue|en}} ==
=== {{S|nom|en}} ===
'''chat''' {{pron|tʃæt|en}}
# Talk.
`;

const NO_FRENCH_WIKITEXT = `{{voir/zebre}}

== {{langue|it}} ==
=== {{S|nom|it}} ===
'''zebre''' {{pron|ˈd͡zɛ.bre|it}} {{f}}
# ''Pluriel de ''{{lien|zebra|it}}.
`;

describe("extractDefinitions", () => {
  it("extrait les définitions françaises numérotées, dans l'ordre", () => {
    expect(extractDefinitions(CHAT_WIKITEXT)).toEqual([
      "(félins) Mammifère carnivore de taille moyenne.",
      "(en particulier) Individu mâle de cet animal.",
    ]);
  });

  it("ignore les lignes d'exemple (#*) et de sous-note (#:)", () => {
    const defs = extractDefinitions(CHAT_WIKITEXT);
    expect(defs.some((d) => d.includes("erraient"))).toBe(false);
    expect(defs.some((d) => d.includes("Note"))).toBe(false);
  });

  it("ignore les définitions des sections en langue étrangère", () => {
    const defs = extractDefinitions(CHAT_WIKITEXT);
    expect(defs.some((d) => d === "Talk.")).toBe(false);
  });

  it("retourne un tableau vide quand il n'y a aucune section française", () => {
    expect(extractDefinitions(NO_FRENCH_WIKITEXT)).toEqual([]);
  });
});
