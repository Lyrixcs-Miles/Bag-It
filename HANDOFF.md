# Handoff (2026-10-30)

## Where things live
- Shopify theme is at the repo root (Dawn-based). Custom code: `assets/bb-storefront.css`, `assets/bb-storefront.js`, `sections/bb-*.liquid`, `snippets/bb-*.liquid`.
- Pushing to `main` auto-syncs to the Shopify theme **"Bag-It/main"** (GitHub integration). That theme is **unpublished**; the live theme is still **Horizon**. Publish in Shopify admin → Online Store → Themes.
- Store: Bag It (2v0xvw-1f.myshopify.com), trial plan, ZAR.

## Done
- Responsive layout for home, product, cart, collection (desktop/tablet/phone). Phones hide product thumbnails, keep colour picker.
- Product ticker scrolls continuously.
- Extra product photos placed by alt text: "worn/carried/lifestyle/styled" → "Carry it your way" band; "dimension/size/measure" → size guide by the FAQ; anything else → "Inside the details". Photos added to Travel Weekender (3) and Bow Tote (1).
- Cart page: checkout button ring/width, quantity boxes, empty band fixed.
- Bug fixes: Buy now goes straight to checkout; bag count read from Shopify; Contact link → `/pages/contact`; popup checkout link; home brand setting; "More bags" taglines; FAQ copy.
- New contact page: `sections/bb-contact.liquid` + `templates/page.contact.json` (store header/footer, styled form). Contact email card only shows if set in section settings (avoids publishing a private email).

## Still to do
1. **All product prices are R 0.00** in Shopify. Set real prices before publishing.
2. Restart `shopify theme dev` (it shows a stale "sections/sed…" upload error), then test on the dev preview: contact form submit, Buy now → checkout, Add to bag count, cart on a real phone.
3. Foldaway Tote has no extra photos yet.
4. Preview "Bag-It/main", then publish it.

## Gotchas
- Don't run `sed -i` inside the theme folder while `theme dev` runs (temp files get uploaded).
- No subfolders inside `assets/` (Shopify rejects them; e.g. `assets/.aistudio`).
