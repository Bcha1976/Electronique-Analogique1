# Électronique Analogique 1 : site web du cours

Ouvrez `index.html` dans un navigateur. Le site est statique (HTML, CSS, JavaScript), fonctionne hors ligne et peut être copié tel quel sur GitHub Pages, Moodle ou tout hébergeur. Rien n’est chargé depuis Internet : les formules sont déjà rendues en SVG.

Si le navigateur bloque les fichiers locaux, lancez un petit serveur **depuis ce dossier** (celui qui contient `index.html`) :
`python3 -m http.server 8000`, puis ouvrez http://localhost:8000/.

## Barre supérieure
Accueil · Sommaire · Cours · Exercices · Interactifs.

- **Accueil** : couverture, présentation, cartes des chapitres, interactifs, téléchargements (polycopié, énoncés, corrigés, note SBOA068, en lien vers le site de Texas Instruments).
- **Sommaire** : chaque chapitre et chaque section, avec les numéros du PDF.
- **Cours** : chapitres 0 à 5 et annexes A à C (hors des 21 heures), générés depuis la source XeLaTeX du polycopié. Même texte, mêmes encadrés, figures, tableaux et numéros d’équations et de figures que le PDF.
- **Exercices** : une série par chapitre (0 à 5). Chaque exercice de travaux dirigés est suivi de son corrigé détaillé, replié ; les exercices d’application du cours (déplacés du polycopié dans le recueil de TD) suivent, avec leur réponse repliée. Boutons « Tout ouvrir » et « Tout replier ».
- **Interactifs** : quatre interactifs, chacun sur sa page et aussi dans son chapitre, à la section qu’il illustre :
  1. Linéariser une diode autour de Q (chapitre 1, section 1.9)
  2. Le RC vu dans le temps et en fréquence : signal carré et diagramme de Bode (chapitre 2, section 2.5)
  3. Quatre modèles de diode, un même circuit (chapitre 3, section 3.3)
  4. Montage générique du transistor : du blocage à la saturation (chapitre 4, section 4.3)

  Tous sont calculés avec les équations du cours et ses valeurs de référence (diode I_S = 8,7 fA, n = 1, V_T = 25,85 mV ; RC 1 kΩ, 100 nF ; transistor I_S = 1,2·10⁻¹⁴ A, β = 100, V_A = 100 V). Chaque réglage est placé à côté de la figure qu’il commande ; des boutons de préréglage donnent les cas du cours (blocage, actif, saturation…) et le point se déplace lentement vers sa nouvelle position.
  La page Interactifs donne aussi les sept explorateurs placés dans les chapitres.

## Navigation
- Le navigateur de gauche montre tous les chapitres ; le chapitre ouvert liste ses sections.
- La section en cours de lecture est surlignée et une barre indique la progression dans le chapitre.
- Le champ de recherche filtre les sections ou les exercices.
- Les boutons Précédent et Suivant changent de chapitre ; le bouton Exercices ouvre la série du chapitre.
- Sur téléphone, le navigateur s’ouvre en tiroir (bouton « Navigateur »).
- Un clic sur une figure l’ouvre en grand (zoom, plein écran).

La barre supérieure indique où vous êtes : « Chapitre n · titre court » (ou « Annexe A · … ») sur les pages de chapitre et d’exercices, le nom de la page ailleurs. Le pied de page porte ENISO 2026/2027 | Dr Bassem CHAABANE | Électronique Analogique 1 sur toutes les pages.

## Régénérer après une modification des sources
Depuis le projet du polycopié : `bash outils_site/make_site.sh DOSSIER_SITE DOSSIER_PDF PROJET_TD_ENONCES PROJET_TD_CORRIGES` (variable facultative `EA1_ZIPS` : dossier des trois zip proposés au téléchargement). Prérequis : python3, pandoc 3, XeLaTeX, poppler-utils, ghostscript, Node.js et, une fois, `(cd outils_site/node && npm install)`.

- `outils_site/build_site.py` convertit le texte LaTeX (chapitres, travaux dirigés) en HTML et vérifie les numéros contre le fichier `.aux` du PDF.
- `outils_site/site_v2.py` écrit les pages, place les interactifs (liste `IX`) et fusionne énoncés et corrigés.
- `assets/site.css` et `assets/site.js` : feuille et navigateur du site « Semiconductor Devices Physics » v2 ; `assets/ea1.css` : compléments propres au cours.
- `assets/ix/*.js` : un fichier par interactif (même contrat que le site « Semiconductor Devices Physics ») ; `assets/ix/kit.js` : outils communs (curseurs, préréglages, tracés).
