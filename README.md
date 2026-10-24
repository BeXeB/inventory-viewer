# BeXe Inventory Viewer

Static Angular app for viewing the compact inventory links posted by `!inventory` and building a complete `!setequip` command.

## Development

```sh
npm ci
npm start
```

Run the unit tests with `npm test -- --watch=false`; build the production app with `npm run build`.

Inventory links are decoded in the browser. The page does not call a backend, upload inventory data, or send commands to Twitch. Anyone who has an inventory URL can read its encoded ownership and currently equipped skins.

## Payload and catalog

The canonical item order and versions live in `shared/contracts/inventory-link.ts` in [`BeXeB/twitch-chat-pro-max`](https://github.com/BeXeB/twitch-chat-pro-max). The generated [`src/app/inventory-catalog.generated.ts`](./src/app/inventory-catalog.generated.ts) file must stay in sync because both link and equipment bitsets use catalog indexes.

The bot repository's `Sync inventory catalog to viewer` GitHub Actions workflow regenerates this file when the canonical catalog changes and opens or updates a PR in this repo. Configure an `INVENTORY_VIEWER_PR_TOKEN` secret in `BeXeB/twitch-chat-pro-max`, using a fine-grained token scoped only to `BeXeB/inventory-viewer` with **Contents: read and write** and **Pull requests: read and write** permissions. Review and merge the generated catalog PR before publishing the new catalog. The viewer repository's `main` branch must exist before the sync workflow can check it out.

## GitHub Pages

The `Deploy inventory viewer` workflow builds and publishes the app to GitHub Pages when `main` changes. In repository settings, enable Pages with **GitHub Actions** as the source. The included `src/CNAME` configures `inv.bexe.dev`; the domain's DNS must point to GitHub Pages. The included `404.html` redirects a direct `/<payload>` deep link through the app's payload query fallback.
