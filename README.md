# BeXe Inventory Viewer

Static Angular app for viewing the compact inventory links posted by `!inventory` and building a complete `!setequip` command.

## Development

```sh
npm ci
npm start
```

Run the unit tests with `npm test -- --watch=false`; build the production app with `npm run build`.

Inventory links are decoded in the browser. The page does not call a backend, upload inventory data, or send commands to Twitch. Anyone who has an inventory URL can read its encoded ownership and currently equipped skins.

## Payload, catalog, and preview renderer

The canonical item order and versions live in `shared/contracts/inventory-link.ts` in [`BeXeB/twitch-chat-pro-max`](https://github.com/BeXeB/twitch-chat-pro-max). The generated [`src/app/inventory-catalog.generated.ts`](./src/app/inventory-catalog.generated.ts) file must stay in sync because both link and equipment bitsets use catalog indexes.

The bot repository's `Sync inventory viewer sources` GitHub Actions workflow regenerates the catalog and copies the shared overlay message renderer from `src/app/shared/overlay-message/` when either source changes, then opens or updates a PR in this repo. Treat [`src/app/shared/overlay-message/`](./src/app/shared/overlay-message/) as generated; its canonical source is in `BeXeB/twitch-chat-pro-max`. Configure an `INVENTORY_VIEWER_PR_TOKEN` secret in `BeXeB/twitch-chat-pro-max`, using a fine-grained token scoped only to `BeXeB/inventory-viewer` with **Contents: read and write** and **Pull requests: read and write** permissions. Review and merge the generated PR before publishing the matching catalog and preview renderer. The viewer repository's `main` branch must exist before the sync workflow can check it out.

## GitHub Pages

The `Deploy inventory viewer` workflow builds and publishes the app to GitHub Pages when `main` changes. In repository settings, enable Pages with **GitHub Actions** as the source. The included `src/CNAME` configures `inv.bexe.dev`; the domain's DNS must point to GitHub Pages. The included `404.html` redirects a direct `/<payload>` deep link through the app's payload query fallback.
