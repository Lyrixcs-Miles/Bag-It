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

## Continuation (2026-10-30)
- Restarted the stale development server. The preview is running at `http://127.0.0.1:9292`, using development theme `157920723100`. The old upload error is gone.
- Verified the contact page on the development preview at desktop and phone widths. Updated its field names to Shopify's standard `contact[name]`, `contact[phone]` and `contact[body]` names.
- Verified two Add to bag operations against Shopify's actual cart count (1, then 2). Checked the cart styling at desktop and phone widths in a standalone browser page. This is browser emulation, not a physical-phone test.
- Verified that Buy now requests Shopify checkout without opening the added-to-bag popup. Shopify then displays **"This store isn't set up to receive orders yet."** No order was placed; the isolated test cart was cleared.
- Fixed the remaining hard-coded popup checkout URL. Checkout links and fallback actions now use the locale-aware root route.
- Added **"Price coming soon"** placeholders for zero/unset prices on product, collection and cart pages. Unpriced variants cannot use Buy now; cart checkout and accelerated checkout are unavailable when the cart contains unpriced items. Add to bag remains available for preview testing. Mixed-price carts are sent to cart review instead of checkout.
- The catalog initially returned R0.00 for all variants, then changed to **R150.00 for all variants during this session**. These catalog values were not changed by this agent and have been preserved. Treat them as placeholders until the merchant confirms final prices.
- Checked unset-price, priced, sold-out and mixed-cart behavior in isolated browser fixtures using the actual storefront JavaScript. Validated all 9 changed theme files with the Liquid validator; Theme Check reports zero errors and 12 existing warnings. JavaScript syntax checking passes.
- The user approved one labelled contact-form test message and supplied the storefront preview password. The password was accepted and was not saved in the repository. The completed form passes native validation, but Shopify presents an **hCaptcha challenge before submitting**. Submission/delivery is therefore **not confirmed**; a person must complete the verification. Do not automate or bypass the challenge, and do not resend a successful test.
- Theme status confirmed: **Horizon** (`157920297116`) remains live; **Bag-It/main** (`157921083548`) remains unpublished.

## Still to do
1. Confirm final prices; the current R150 catalog values have not been confirmed as retail prices.
2. Complete the single approved contact-form test in a normal browser, including Shopify's hCaptcha verification, and verify the success response. Do not resend a successful test.
3. Complete Shopify's store setup so checkout can accept orders. The theme redirect is working, but Shopify currently refuses orders.
4. Check the cart on a physical phone.
5. Foldaway Tote still has no additional lifestyle/detail photos; only its five colour photos are available locally.
6. Review the unpublished "Bag-It/main" theme, then publish only when pricing and order setup are ready.

## Gotchas
- Don't run `sed -i` inside the theme folder while `theme dev` runs (temp files get uploaded).
- No subfolders inside `assets/` (Shopify rejects them; e.g. `assets/.aistudio`).
