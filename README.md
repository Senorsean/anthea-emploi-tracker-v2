# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/203d2aff-eb03-48ba-81af-fd4166240394

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/203d2aff-eb03-48ba-81af-fd4166240394) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/203d2aff-eb03-48ba-81af-fd4166240394) and click on Share -> Publish.

## Configuration des clés API

Créez un fichier `.env` à la racine du projet en vous inspirant de `.env.example` :

```bash
VITE_POLE_EMPLOI_CLIENT_ID=<votre identifiant partenaire>
VITE_POLE_EMPLOI_CLIENT_SECRET=<votre clé secrète>
# Optionnel : jeton d'accès déjà obtenu
VITE_POLE_EMPLOI_API_KEY=<votre jeton d'accès>
```

Ce fichier n'est pas suivi par git et vous permet d'ajouter vos identifiants en toute sécurité.

## Offres du jour

Renseignez vos préférences (poste, localisation et type de contrat) dans le module **Offres du jour**. Ces préférences sont enregistrées localement et synchronisées avec votre compte Supabase. À chaque visite, l'application récupère automatiquement des annonces correspondant à ces critères grâce à l'API Pôle Emploi.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Exporter un rapport

Dans la section **Statistiques**, cliquez sur **Exporter** pour télécharger un fichier `rapport.html`. Ce rapport reprend les codes couleurs et le design de l’application pour une lecture rapide et ergonomique.

