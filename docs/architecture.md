# Architecture and maintenance

[Back to README](../README.md)

## Source layout

| File | Purpose |
| --- | --- |
| `src/products.ts` | Three products, their colour variants, image paths, route and bag-key helpers. |
| `src/App.tsx` | Homepage carousel, product pages, galleries, zoom, purchase summaries and shopping bag. |
| `src/checkout.ts` | Optional checkout URLs keyed by product slug and colour ID. |
| `src/index.css` | Typography, responsive layouts, dialogs and animations. |
| `public/images/bags/transparent/` | All 14 transparent studio product cutouts used by the storefront. |
| `public/images/bags/` | Preserved source photographs. |
| `docs/product-image-prompts.json` | Image generation prompts and source-to-output mapping. |
| `index.html` | Shared metadata, favicon and font loading. |
| `.github/workflows/deploy.yml` | Existing GitHub Pages build and deployment workflow. |

`src/main.tsx` renders `App` in React StrictMode. The site is a static application with no backend.

## Products and routes

`PRODUCTS` separates product identity from variant identity. Each product has a stable slug, name, description, collection theme, details, and a variant array. Each variant has an ID, label, swatch, photograph and matching `theme` with background and accent colours. Selecting a variant updates the whole product-page background, purchase button, selected controls and zoom background. The palettes keep white page text and dark button text readable. Reduced-motion preferences disable the background transition. The black weekender also has an alternate photograph.

`readRoute` reads hashes such as `#/products/foldaway-tote?color=navy`. Unknown colours fall back to the product's first variant. Unknown product routes show the collection. The `hashchange` listener supports direct links and browser back/forward navigation.

Route state stores the hash and resolves the current product from the latest catalog on each render. Product comparisons use stable slugs, so live catalog updates cannot cause the current bag to appear in its own recommendations or reset its collection index.

The product page is keyed by product slug. Changing a colour preserves the page and its scroll position, while resetting the gallery and purchase controls to the selected variant. Changing products mounts the new page at the top. Section links scroll within the product page without changing the route.

## Galleries and purchase controls

The selected variant controls the main photograph, colour label, image zoom, purchase summary and add-to-bag action. Thumbnails show the product's colour photographs, with alternate views where supplied. Zoom ranges from 100% to 300% in 50% steps.

The homepage has colour swatches for the featured product. Selecting one updates its transparent photograph, background, accents, purchase summary and product link together. Selected colour IDs are remembered per product during the current visit, including when returning from a product page. Its carousel derives navigation and position from the product count. It supports style buttons, previous/next buttons, arrow keys and touch swipes. Keyboard carousel navigation is suspended while a dialog is open or an interactive control is focused.

## Browser-local shopping bag

`addToBag` dispatches `bowcarry:add-to-bag` with a product-and-colour key and quantity. `BagControl` updates state and opens the bag dialog. A saved entry looks like:

```json
{
  "bow-tote:black": 1,
  "bow-tote:brown": 2,
  "foldaway-tote:navy": 1
}
```

`readBag` accepts known variant keys and finite numeric quantities, rounds down, and clamps to 0–10. Invalid JSON falls back to an empty bag. The storage key is `bowcarry-shopping-bag-v2`; prior tumbler entries are not altered.

Saving runs in a React effect. A `storage` listener synchronizes other tabs. If persistence fails, the bag keeps the current in-memory selection and displays a notice. It does not synchronize across devices or validate inventory.

## Content changes

Edit `src/products.ts` to change product descriptions, colour labels, image paths or swatches. Keep slugs and variant IDs stable to preserve links and saved bags. Add supplier-confirmed specifications only after verifying them; prices, materials, dimensions, capacity and inventory are not defined.

Preserve original photographs in `public/images/bags/`. Put final transparent PNGs in `public/images/bags/transparent/`; keep their alpha channel intact. Image containers are transparent so cutouts blend into the collection theme. Current paths assume deployment at the domain root. Keep shared metadata in `index.html` aligned with the collection.
