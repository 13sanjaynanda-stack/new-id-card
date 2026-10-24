# Visiting Card Studio

A responsive browser app for creating a 90 × 50 mm landscape visiting card from a name, contact number, address, and passport photo.

## Run locally

Install Node.js, then from this project directory run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Complete all fields, choose a photo, and select **Prepare PDF**. In the print dialog, choose **Save as PDF**, enable background graphics, and keep scale at 100% / actual size.

The form data and photo are handled in the browser and are not uploaded.

## Publish with GitHub Pages

1. Create a **public** repository on GitHub and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set the build source to **GitHub Actions**.
3. The included workflow builds and deploys the app whenever you push to `main`. Check the **Actions** tab for completion.
4. After the first successful deployment, open **Settings → Pages** to find the public URL. It will usually be `https://<github-user>.github.io/<repository-name>/`.

The source repository and app will be public, but visitor form entries and photos remain in each visitor's browser; they are not sent to the repository or to you.

## Build

```sh
npm run build
npm run preview
```