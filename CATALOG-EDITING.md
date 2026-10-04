# Updating the AWE Faith & Service app catalog

The installed app loads `dist/catalog.json` from the live site every time it opens. To add a game, study, shop item, or community service listing, update this JSON file and publish the changed catalog file to the same site. People who already installed the app do not need a new download or app installation.

Keep the top-level structure and valid JSON syntax:

```json
{
  "updated": "YYYY-MM-DD",
  "studies": [],
  "games": [],
  "products": [],
  "resources": []
}
```

Each study or game item uses `id`, `title`, `tag`, `audience`, `description`, `url`, and `kind` (`study` or `game`). Products use `title`, `price`, `description`, and `url`. Local resources use `title`, `category`, `address`, `description`, `phone`, and `url`; only include details confirmed by the organization. All external links should use HTTPS. Keep Bible resources and games focused on Christian and Scripture themes.

The site checks the catalog when opened; the service directory also offers Google Maps, 211, and Findhelp searches based on a visitor's city, ZIP code, or chosen device location. It does not save a visitor's location.
