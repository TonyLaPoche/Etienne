<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Objectif produit

ADTP Fiches est une PWA. L'objectif est une application intuitive et ergonomique : navigation claire, cibles tactiles confortables, lisibilité sur iPhone mini (370px), tablette et desktop, actions principales toujours accessibles.

Les icônes sont un sous-ensemble de Material Symbols Outlined, intégré dans `src/components/material-icons.ts` pour rester léger hors ligne.

Les couleurs viennent du site ADTP (https://www.adtp.com/) : rouge `#E74536`, bordeaux `#6F2D2F`, gris `#444A4F`. Le bleu `#0F548B` et le vert `#1A8B53` de leurs blocs savoir-faire servent aux graphiques et aux indicateurs.

Hébergement cible : GitHub Pages, export statique (`output: "export"`). Pas de serveur : authentification et fiches vivent dans le navigateur, avec deux comptes administrateurs en dur.
