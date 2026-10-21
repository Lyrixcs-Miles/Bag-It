# Deployment and verification

[Back to README](../README.md)

## Build and preview

From the repository root:

```sh
npm ci
npm run lint
npm run build
npm run preview
```

`npm ci` installs the lockfile exactly. `npm run lint` performs TypeScript checking. `npm run build` creates `dist/`, and `npm run preview` serves that output locally; use the URL printed by Vite.

The repository does not currently contain automated tests, continuous integration, or hosting configuration. A successful type check and build do not replace a visual and interaction review.

## Static hosting

Configure the host with:

| Setting | Value |
| --- | --- |
| Dependency installation | `npm ci` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Runtime server | None required for the built files |
| Environment variables | None required by the current application |

Serve `index.html` at the site root and preserve the generated asset paths. Do not publish the repository's `node_modules/` directory or use the development server as a production server.

Hash routes such as `/#/products/mint` are interpreted by the browser after loading the root page. The host receives a request for `/`, not `/products/mint`.

The current `/images/...` product paths and Vite configuration assume root-domain hosting. Hosting under a path such as `/BlushBloom/` requires coordinated Vite base and image-path changes. This has not been configured in the repository.

Fonts are loaded from Google Fonts. If that service is unavailable, the configured sans-serif fallbacks are used. Images, scripts, and styles are served from the built site.

`public/CNAME` declares `blush.azhyre.co.za` as the custom domain. Vite copies it into `dist/` on every build. The file alone does not verify DNS or TLS.

The site is hosted on GitHub Pages. `.github/workflows/deploy.yml` builds the site and publishes `dist/` on every push to `main`. The repository's Pages source must be set to **GitHub Actions**. If it is set to deploy from a branch, Pages serves the unbuilt source `index.html` and the site shows a blank page.

## Checkout configuration

The current checkout-link values are blank. To configure a product handoff, edit `src/checkout.ts`:

```ts
export const CHECKOUT_LINKS: Record<string, string> = {
  'blush-pink': 'https://your-store.example/your-pink-checkout',
  'midnight-black': '',
  'lavender': '',
  'mint': '',
};
```

The example URL is a placeholder; replace it with the real checkout destination for the correct product. Leave a value blank until that destination is ready. The application enables the link only when it starts with `https://`.

Rebuild after changing the configuration. For each configured color, verify the destination product, quantity handling, price, currency, availability, delivery options, and payment flow at the checkout provider.

This configuration enables a direct product link only. It does not connect the local shopping bag, establish a store API session, create a multi-item checkout, or synchronize prices and inventory. The bag checkout button remains disabled. Those features require further development.

## Manual release checks

### Collection and navigation

1. Open the collection at desktop and mobile widths.
2. Switch through all four colors using swatches and carousel buttons.
3. Check keyboard arrow navigation and horizontal touch swipes.
4. Confirm the selected image, background, product label, purchase summary, and product link agree.
5. Open every product route directly and refresh it.
6. Use browser back/forward navigation and �Back to collection�.

### Product pages

1. Check long names such as Midnight Black for wrapping and overflow.
2. Confirm each labeled swatch opens the correct color and indicates selection.
3. Check the framed image, accessory list, purchase buttons, and related-product cards on narrow and wide screens.
4. Use the section navigation and verify it scrolls without leaving the product route.
5. Open the zoom dialog, step from 100% to 300%, scroll the enlarged image, and close it.
6. Toggle every accessory group and reset the illustrated look. Confirm the actual product and bag remain the complete set.
7. Expand the FAQs and follow related-color links.

### Bag and purchase dialogs

1. Add a product from its page and confirm the bag opens with the correct color.
2. Add a second color and verify the total item count.
3. Increase a quantity to ten, decrease it, and remove a line.
4. Reload a product page and confirm the saved bag is restored.
5. Open two tabs on the same origin and confirm quantity updates synchronize.
6. With checkout links blank, confirm the unavailable notice appears and no payment action is enabled.
7. In the unconfigured purchase summary, change quantity and add it to the bag.
8. Close dialogs using the close button, backdrop, and Escape key. Check keyboard focus and tab navigation.

### Motion and metadata

1. Enable the operating system's reduced-motion preference and inspect the carousel and product animations.
2. Check keyboard focus visibility on links, buttons, and accessory checkboxes.
3. Confirm each product updates the document title.
4. Review the shared description and social metadata in `index.html` before a public launch.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Checkout is disabled | Confirm the exact slug and HTTPS URL in `src/checkout.ts`, then rebuild. The bag checkout remains disabled by design. |
| Bag appears empty on another device | Storage is local to a browser and site origin; there is no account synchronization. |
| Bag is not saved | Browser storage may be blocked or full. The bag notice explains that persistence failed. |
| Images fail on a hosted site | Confirm the files are in `public/images/`, file-name case matches, and the site is deployed at the domain root. |
| Product URL opens the collection | Use the documented `/#/products/...` route and an exact known slug. |
| Editing a base CSS rule has no visible effect | Inspect later responsive and product-refinement overrides in `src/index.css`. |
| `npm` is blocked by PowerShell execution policy | Run `npm.cmd` in place of `npm`, or use a shell permitted by your environment. |
| Dependency installation reports a locked native module on Windows | Stop the development or preview process using that module and retry. Avoid deleting files used by a running build. |
| A deployed change is missing | Confirm the expected commit was built and deployed, then check host or browser caching. A GitHub push alone is not a deployment. |

## Git workflow

Review the intended changes, run the applicable checks, and commit only source, assets, configuration, and documentation needed by the project. Keep `package-lock.json` aligned with `package.json`.

```sh
git status
git diff --check
npm run lint
npm run build
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

For documentation-only edits, check the facts, examples, links, and diff; rebuilding unchanged application code is normally unnecessary.

Generated output, dependencies, logs, coverage, and environment files are excluded by `.gitignore`. Preserve source license notices. Do not rewrite published history as part of routine cleanup.
