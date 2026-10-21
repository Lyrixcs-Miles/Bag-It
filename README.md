# Blush&Bloom

A tumbler storefront with four colorways, coordinated accessories, product detail pages, and a shopping bag saved in the browser.

Built with React, TypeScript, Vite, and Tailwind CSS.

## Development

Install Node.js 22 or later, then run:

```sh
npm ci
npm run dev
```

The development server runs at http://localhost:3000. No API keys or environment variables are required.

## Checks and production build

```sh
npm run lint
npm run build
npm run preview
```

`lint` runs the TypeScript compiler without emitting files. The production build is written to `dist/`; deploy that directory to a static host.

## Products and checkout

Product images are in `public/images/`. Color definitions and product content are in `src/App.tsx`; styles are in `src/index.css`.

Add the secure checkout URL for each color in `src/checkout.ts` to enable checkout handoff. Checkout is currently unconnected, so the storefront does not take payments. Prices, inventory, quantity, and delivery must be confirmed by the checkout provider.

Shopping bag contents are stored locally in the visitor's browser, with a limit of ten items per color.
