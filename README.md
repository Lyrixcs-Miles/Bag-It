# Blush&Bloom — The Carry Collection

A React storefront featuring three bag styles and their matching colour variants. Colour choices on the homepage and product pages update the bag photograph, background and accents together. Shoppers can browse transparent studio product images, zoom in, and add that exact style and colour to a browser-local shopping bag.

## Collection

| Product | Product route | Colours |
| --- | --- | --- |
| Bow Tote | `/#/products/bow-tote` | Black, Brown |
| Foldaway Tote | `/#/products/foldaway-tote` | Black, Navy, Olive, Khaki, Brown |
| Travel Weekender | `/#/products/travel-weekender` | Black, Black & Tan, Blush & Tan, Rose, Peach, Cream & Tan |

A colour can be linked directly, for example `/#/products/foldaway-tote?color=navy`. The storefront uses 14 transparent studio product cutouts in `public/images/bags/transparent/`, including an additional black weekender view. The supplied source photographs remain in `public/images/bags/`. Product names and colour labels are descriptive storefront labels based on the supplied photographs.

Image generation prompts and asset provenance are recorded in [the image manifest](docs/product-image-prompts.json).

## Development

Use Node.js 22 or later:

```sh
npm ci
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port 3000. |
| `npm run lint` | Check TypeScript without emitting files. |
| `npm run build` | Build the static site in `dist/`. |
| `npm run preview` | Preview the production build. |

The application uses React 19, TypeScript, Vite, Tailwind CSS, and Lucide icons. Anton and Inter are loaded from Google Fonts. No API key or backend is required.

## Shopping and checkout

Each style and colour has a separate bag entry. Quantities are capped at ten per variant. Entries persist under `bowcarry-shopping-bag-v2` in `localStorage` and synchronize between tabs on the same origin. The previous tumbler bag's storage is retained separately.

Buy now opens a purchase summary with the selected product photograph, colour and quantity. Online checkout is not connected; the site does not take payments, create orders, or synchronize inventory. Configure a verified HTTPS URL in `src/checkout.ts`, keyed by product and colour (for example `bow-tote:black`), to enable a direct checkout handoff for that variant. The local multi-item bag is not transmitted to that provider.

## Maintenance and deployment

- [Architecture and maintenance](docs/architecture.md)
- [Deployment and verification](docs/deployment.md)

The existing GitHub Pages workflow builds and deploys `dist/` when changes are pushed to `main`. The custom domain declaration remains in `public/CNAME`.

Preserve existing license notices when editing source files. `src/App.tsx` contains an Apache-2.0 SPDX notice.
