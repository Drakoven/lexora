# Dictionnaire français

`fr.dic` et `fr.aff` : Dictionnaire Orthographique Français "Toutes variantes"
v7.0, par Olivier R. (Dicollecte / Grammalecte), licence MPL 2.0 (voir
`LICENSE-MPL-2.0.txt`). Récupéré depuis
https://codeberg.org/dicollage/dictionnaires (dossier `dictionaries/`,
fichiers `fr-toutesvariantes.aff` / `.dic`).

`words.txt` : liste à plat de ~406 000 mots générée depuis `fr.dic`/`fr.aff`
via `generate-wordlist.mjs` (utilise `hunspell-reader` pour développer toutes
les formes fléchies). Chaque mot est normalisé pour coller aux tuiles de
Scrabble, qui n'ont ni accents ni ligatures : `œ`→`oe`, `æ`→`ae`, puis
accents retirés, tout en majuscules. Seules les entrées entièrement en
minuscules dans le dictionnaire source sont gardées (élimine sigles/
acronymes en capitales et la plupart des noms propres).

Pour régénérer `words.txt` après une mise à jour de `fr.dic`/`fr.aff` :
```
cd server
npm install   # installe hunspell-reader (devDependency)
node src/data/dictionary/generate-wordlist.mjs
```

Chargé au démarrage dans [`../game/dictionary.js`](../game/dictionary.js).
