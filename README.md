# ADTP Fiches

POC PWA de fiches personnages et de compétences, réalisé pro bono par Antoine Terrade pour Étienne et ADTP.

Les comptes administrateurs et les données sont en dur dans le navigateur. Rien n’est envoyé à un serveur.

## Comptes de démonstration

- `admin@adtp.local` / `Admin123!`
- `etienne@adtp.local` / `Etienne123!`

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

## GitHub Pages

Chaque push sur `main` publie le site via GitHub Actions. L’export est statique (`output: "export"`).
