# AWE Missions Faith & Service

A public, installable Progressive Web App for AWE Missions. Visitors can explore Christianity, open Bible studies and Scripture games, connect with the mission, browse merchandise, and search for nearby help or ways to serve. No GitHub sign-in is required to use the published app.

## GitHub Pages deployment

The app is in `dist/`. The workflow in `.github/workflows/pages.yml` publishes that directory to GitHub Pages whenever changes reach `main`. The first Pages deployment may require enabling **Settings → Pages → Build and deployment → GitHub Actions** for this repository.

Once the deployment succeeds, open the Pages URL on Android in Chrome and choose **Install app** or **Add to Home screen**. The app is a PWA; this repository does not contain a native APK.

## Update the app catalog

Studies, Bible games, merchandise, and confirmed community listings are read from `dist/catalog.json` when the app opens. Add new offerings there to update existing installs without rebuilding or reinstalling the app. See [`CATALOG-EDITING.md`](CATALOG-EDITING.md) for the format.

The local service finder sends searches to Google Maps, 211, or Findhelp using a city/ZIP or a one-time location lookup; it does not save a visitor's location.
