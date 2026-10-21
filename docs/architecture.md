# Architecture and maintenance

[Back to README](../README.md)

## Source layout

```text
CNAME                      Custom domain declaration
index.html                 HTML entry, metadata, and font loading
package.json               Scripts and direct dependencies
package-lock.json          Locked dependency graph
vite.config.ts             React and Tailwind Vite plugins
tsconfig.json              TypeScript compiler settings
public/images/             Four transparent tumbler product images
src/main.tsx               React root, StrictMode, and stylesheet import
src/App.tsx                Product data, pages, dialogs, and interaction state
src/checkout.ts            Product-specific checkout URLs
src/index.css              Shared styles, responsive rules, and animations
docs/                      Architecture and deployment guides
```

## Application structure

`src/main.tsx` renders `App` inside React StrictMode. `App` contains the collection carousel and conditionally renders a product page based on the current hash.

The product data is the `IMAGES` array in `src/App.tsx`. Each entry contains an image path, display name, page background color, and panel color. `productSlug` converts the display name to a lowercase slug by replacing spaces with hyphens.

The supporting components live in the same file:

| Component | Responsibility |
| --- | --- |
| `App` | Route selection, carousel state, product pages, and scroll reveals. |
| `BagControl` | Local bag persistence, bag dialog, and quantity controls. |
| `BuyButton` | Add-to-bag action and product purchase-summary dialog. |
| `ProductExtras` | Zoom dialog and illustrated accessory preview. |

## Routing and page state

`productFromHash` matches `window.location.hash` against the known product routes. The `hashchange` listener updates the product index and active carousel color. An unmatched hash renders the collection view; there is no dedicated 404 page.

Product section links prevent normal hash navigation and call `scrollIntoView` instead. This keeps the product route intact while scrolling within `.product-page`.

The document title changes for each product. The HTML description and social metadata in `index.html` remain shared across routes. There is no server-side rendering or per-product social preview generation.

The product page is keyed by color name, so changing color remounts its subtree. The product heading receives focus without forcing a page scroll. Scroll reveal effects use an `IntersectionObserver` rooted in the product page's scroll container, with cleanup when the selected product changes.

## Bag data flow

`addToBag` dispatches a `bowcarry:add-to-bag` custom event containing a product slug and quantity. A mounted `BagControl` handles that event, updates React state, and opens the bag dialog.

The saved format maps product slugs to quantities:

```json
{
  "blush-pink": 2,
  "midnight-black": 0,
  "lavender": 1,
  "mint": 0
}
```

`readBag` accepts finite numeric quantities, rounds them down, and clamps them to 0�10 for known products. Invalid JSON falls back to an empty bag. Unknown product keys are excluded when reading persisted data.

Saving happens in a React effect. A separate `storage` listener reloads saved data when another tab changes the bag key or clears storage. This is browser-local persistence, not inventory validation or an order record.

## Purchase and accessory state

Each `BuyButton` owns a purchase dialog and quantity state. The quantity selector is shown only while checkout is unconfigured. A configured checkout link is rendered directly; quantities are not added to its URL.

`ProductExtras` keeps zoom level and accessory toggles in local component state. Those toggles affect only the SVG preview. They are not included in the add-to-bag event or persisted storage.

## Styling

`src/index.css` imports Tailwind and defines the Anton and Inter font tokens. The collection hero also uses Tailwind utility classes and inline carousel positioning.

Product pages receive `--product-bg` and `--product-panel` custom properties from their selected color. Product styling, shared responsive composition, dialog styles, and the final product-page refinements are in `src/index.css`.

Some selectors have multiple definitions as responsive and refinement rules override earlier base styles. Read the later rules before changing an earlier declaration. Scope product page changes to product classes to avoid altering the approved collection hero.

The document itself does not scroll; the collection and product views provide their own viewport-height scrolling containers. Account for this when adding sticky elements, section links, or scroll-triggered effects.

## Updating content

### Change a color or product name

Update its entry in `IMAGES`. Names determine route slugs, saved-bag keys, and checkout lookup keys, so renaming a product can break old links and leave earlier stored quantities unused. Update `src/checkout.ts` and this documentation when a slug changes.

Swatch colors are also defined separately in the collection and product markup. Keep those palettes aligned with the product data.

### Replace product photography

Replace the relevant PNG in `public/images/`, or update the source path in `IMAGES`. Preserve transparency and leave enough room around the full accessory set for `object-fit: contain` layouts.

Check the collection hero, main product image, zoom viewer, detail crops, style illustration, related products, and bag thumbnail after replacing an image. Several sections reuse the same source with different cropping or scaling.

### Change product descriptions or FAQs

Edit the product page markup in `src/App.tsx`. Most copy is shared between colors, with the selected product name inserted dynamically. Keep included-accessory wording consistent across the product page, purchase summary, and bag.

### Add a fifth product

Adding an array entry alone is insufficient. The carousel uses four-item modulo arithmetic, two independently defined swatch palettes, and layout assumptions built around four colors. Update these together with checkout keys, related products, route documentation, and manual verification.

### Change the brand or social metadata

Update the collection header, product header/footer, document-title effect, and `index.html` metadata. Font loading is also configured in `index.html`.

## Maintenance boundaries

The application currently has no network-backed product catalog, authentication, backend service, or administrative UI. Content changes require source edits and a new build.

Keep credentials out of frontend source and checkout URLs. Anything bundled into this application can be inspected by visitors. If future integrations require secrets, add a server-side boundary rather than embedding them in the Vite bundle.
