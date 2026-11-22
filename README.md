# ADTP Fiches

POC PWA de fiches personnages et de compétences, réalisé pro bono par Antoine Terrade pour Étienne et ADTP.

La connexion passe par Firebase Auth (projet `manutio`). Les fiches et les compétences sont dans Firestore, collections `personnages` et `competences`. Les règles du fichier `firestore.rules` n'autorisent que les comptes connectés.

## Comptes

- Administrateur : `admin@adtp.com` / `admin123`
- Opérateur : `etienne@adtp.com` / `etienne123`

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

## GitHub Pages

Chaque push sur `main` publie le site via GitHub Actions. L’export est statique (`output: "export"`).

Le site est accessible sur https://tonylapoche.github.io/Etienne/.
