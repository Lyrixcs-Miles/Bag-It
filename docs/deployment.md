# Deployment and verification

[Back to README](../README.md)

## Build and preview

```sh
npm ci
npm run lint
npm run build
npm run preview
```

TypeScript checking and the production build must pass. Vite creates the static site in `dist/`. No runtime environment variables or backend are required.

## Existing hosting

The repository uses GitHub Pages. `.github/workflows/deploy.yml` builds the application and publishes `dist/` on pushes to `main`. Configure the repository's Pages source as **GitHub Actions** so it serves the built application. `public/CNAME` declares the existing custom domain and is copied into the production output.

Product hash routes such as `/#/products/bow-tote?color=brown` load through the root document. Current image paths assume root-domain hosting; hosting under a subdirectory requires coordinated asset-path and Vite-base changes.

Fonts are loaded from Google Fonts; sans-serif fallbacks apply if unavailable. Product photographs are served locally with the built site.

## Checkout configuration

`src/checkout.ts` starts with no configured checkout URLs. Add a verified HTTPS destination for each style and colour using its combined key, for example `bow-tote:black`. Keys come from the product slug and variant ID in `src/products.ts`.

The purchase summary offers Continue to checkout only for a configured HTTPS URL. Confirm that the destination matches the chosen colour and handles quantity, pricing, delivery, availability and payment. The application does not append quantity or transmit its browser-local bag. The multi-item bag checkout remains disabled.

## Release checks

1. Check all three homepage products at desktop, tablet and mobile widths. Try style buttons, carousel controls, keyboard navigation and touch swipes.
2. Open every product page and colour. Confirm the photograph, selected swatch, label, purchase summary and bag line agree.
3. Refresh a direct colour link and use browser back/forward navigation. An invalid colour should fall back to the first variant.
4. Inspect every gallery thumbnail, including the alternate black weekender view. Open zoom, increase magnification, scroll and close using Escape or the close control.
5. Add multiple colours of the same style and check that they remain separate bag entries. Change quantities, remove lines, reload and test tab synchronization. Quantities stop at ten per variant.
6. Confirm Buy now uses the current colour and selected quantity. With checkout unconfigured, verify that payment actions remain unavailable.
7. Check narrow-screen overflow, visible keyboard focus, native dialog focus, reduced-motion preference and image descriptions.
8. Verify the title and shared metadata describe bags. Check for failed asset requests and browser errors.

There is no permanent automated browser test suite. The bag update was checked in a separate headless Edge session at desktop and mobile sizes, covering all 13 variants, direct routes, matching images, alternate views, zoom, bag persistence and quantity handling.
