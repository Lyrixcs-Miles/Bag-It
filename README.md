# Blush&Bloom

Blush&Bloom is a browser-based storefront for accessorized tumblers in four coordinated colors. It includes an animated collection page, individual product pages, an illustrated accessory preview, and a shopping bag saved in the visitor's browser.

Repository: [Lyrixcs-Miles/BlushBloom](https://github.com/Lyrixcs-Miles/BlushBloom)

## Current status

The storefront runs as a static React application. Product browsing and the local shopping bag work without a backend or API keys. Online checkout is not connected: the site does not take payments, create orders, or synchronize inventory.

The approved product page design retains the collection's bold typography and coordinated backgrounds, with a framed product image, labeled color choices, paired purchase buttons, and clearer accessory details.

## Documentation

- [Architecture and maintenance](docs/architecture.md): source layout, state, routing, styling, and content changes.
- [Deployment and verification](docs/deployment.md): build process, hosting, checkout setup, manual checks, and troubleshooting.

## Local development

Use Node.js 22 or later with npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The development server binds to `0.0.0.0`, so it can also be reached from other devices on the same network when allowed by the host firewall.

No `.env` file, API key, database, or external store account is required to run the current application.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the dependency versions recorded in `package-lock.json`. |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run lint` | Check TypeScript without emitting files. This is a type check, not an ESLint run. |
| `npm run build` | Create the production site in `dist/`. |
| `npm run preview` | Serve the production build locally for review. |

## Storefront features

### Collection page

The collection opens with the original pink hero, oversized “SIP IN STYLE” lettering, and transparent tumbler photography. Selecting a color updates the background and featured product.

Visitors can browse using color swatches, previous/next buttons, keyboard arrow keys, or horizontal touch swipes. Carousel navigation uses a 650 ms animation lock. “Discover it” opens the selected product page; “Buy now” opens its purchase summary.

### Product pages

Each color has a directly accessible hash route:

| Color | Route | Product image |
| --- | --- | --- |
| Blush Pink | `/#/products/blush-pink` | `public/images/tumbler-pink.png` |
| Midnight Black | `/#/products/midnight-black` | `public/images/tumbler-black.png` |
| Lavender | `/#/products/lavender` | `public/images/tumbler-lavender.png` |
| Mint | `/#/products/mint` | `public/images/tumbler-mint.png` |

Product pages include:

- Product photography, color-specific backgrounds, and labeled color selectors.
- “Add to bag” and “Buy now” controls.
- A description of the matching accessory set.
- An image viewer with zoom from 100% to 300% in 50% steps.
- An illustrated accessory preview with switches for bows, braided handle, shoulder strap, and charms.
- Detail cards, styling suggestions, expandable FAQs, and links to the other colors.
- Section navigation, a back-to-collection link, and responsive mobile layouts.

The accessory preview is illustrative. Its selections do not change the product photograph, bag contents, checkout link, or supplied accessory set. The preview resets when the product page remounts, including when switching color.

### Included accessory set

The product content currently describes:

- A handled tumbler with lid and clear straw.
- A matching straw bow and protective bow boot.
- A braided carry handle and adjustable shoulder strap.
- A fluffy pompom and flower charm chain.

The repository does not define capacity, materials, thermal performance, stock levels, prices, or shipping rates. Confirm these with the merchant before adding claims to the site.

### Shopping bag

The bag supports adding products, increasing or decreasing quantities, removing a color, and showing the total item count. Quantities are capped at ten per color. Decreasing a line to zero removes it from the displayed bag.

Contents are saved in `localStorage` under `bowcarry-shopping-bag`. Reloading the site restores valid saved quantities. Storage changes from another tab are synchronized through the browser's `storage` event. If persistence fails, the bag displays a notice and keeps the current in-memory selection while the page remains mounted.

There are no accounts or server-side carts. Bags do not synchronize between devices, browsers, or separate site origins. Clearing site storage removes the saved bag.

### Purchase summaries and checkout

With the current blank checkout configuration, “Buy now” opens a summary with a quantity selector and a checkout-unavailable notice. Visitors can still add the selected quantity to the local bag. No payment is taken.

A product-specific HTTPS link can be configured in `src/checkout.ts`. When present, its summary offers “Continue to checkout” and sends the visitor to that URL. Quantity, price, delivery, and availability must be confirmed there. The application does not append quantities or transmit the local bag to the checkout provider.

The bag's checkout button remains disabled even when product checkout links are configured. A complete multi-item checkout requires additional implementation.

## Technology

| Area | Implementation |
| --- | --- |
| UI | React 19 and TypeScript |
| Build and development server | Vite 6 with the React plugin |
| Styling | Tailwind CSS 4 and custom CSS |
| Icons | Lucide React |
| Navigation | Browser hash routing |
| Persistence | Browser `localStorage` |
| Dialogs | Native HTML `dialog` elements |
| Typography | Anton and Inter loaded from Google Fonts, with sans-serif fallbacks |

There is no backend, payment SDK, analytics integration, or automated browser test suite in this repository.

## Accessibility and motion

The implementation includes product image descriptions, labels for icon controls, selected-color state, quantity announcements, focus styles, and a focusable product heading. Modal dialogs use the browser's native dialog behavior. Product animations and carousel transitions have reduced-motion CSS overrides.

These are implemented features, not a completed accessibility audit. Keyboard, screen-reader, mobile, and contrast checks should be part of release verification.

## Production build

```sh
npm run lint
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Hash product routes work through the root document and do not require separate server routes for each color. The current asset paths assume deployment at the domain root; see the [deployment guide](docs/deployment.md) before hosting under a subdirectory.

## Repository conventions

Commit source files, product images, documentation, and the npm lockfile. Dependencies, production output, coverage files, logs, and environment files are ignored by Git.

Preserve existing license notices when editing source files. `src/App.tsx` contains an Apache-2.0 SPDX notice; no standalone repository-wide `LICENSE` file is currently included.
