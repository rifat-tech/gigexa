# GIGEXA — Audit Fixes

All issues from the code audit have been resolved. Summary below.

## Critical (were breaking or exploitable)
- **Bank Transfer orders failed.** Added `bank` to the Order `paymentMethod` enum.
- **Price tampering.** `POST /api/orders` now recomputes item prices, subtotal,
  shipping and total from the database. Client-sent prices are ignored.
- **Editing products beyond the first 12 loaded a blank form.** New
  `GET /api/products/id/:id` route; the admin form fetches by ID.

## Security & reliability
- Orders check and decrement `stock`, increment `sold`, inside a transaction
  (falls back automatically on standalone MongoDB that has no replica set).
- Admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars; the
  password is no longer logged.
- Server refuses to start in production without `JWT_SECRET`. Secret unified.
- Product search input is regex-escaped (no more 500s / ReDoS).
- Image uploads are restricted to image MIME types; uploads path is absolute.
- Added `helmet` and rate limiting (auth, public messages, global API).
- Central error handler + `/api` 404 route.

## Data integrity
- Reserved Mongoose field `isNew` renamed to `isNewArrival` everywhere.
- Slug and discount now recompute on product edit.
- Category deletion is blocked while products still reference it.
- Logged-in customers can view their own orders (`GET /api/orders/my`).

## Polish
- 404 page, checkout name truncation, register password min length,
  fixed Call-Us tel link.
- `mediaUrl()` helper resolves `/uploads` image paths to the API origin so
  images load when frontend and API are on different domains.

## Bugs caught while testing
- `recharts` was imported by the Dashboard but missing from `package.json`
  (clean installs would fail the build). Added.
- Creating a product without an image produced a blank record. Fixed.

## New environment variables
Backend `.env`:
- `JWT_SECRET` — **required in production**
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — set before first run in production

## Deployment note (not a code issue)
On Render's free tier the `/uploads` disk is wiped on every redeploy, so
admin-uploaded photos disappear. Use Cloudinary/S3 or a Render persistent disk
for production. Swapping to Cloudinary is a one-line change thanks to `mediaUrl()`.

---

# Round 2 — Full end-to-end flow

Traced every flow (browse → cart → checkout → order → admin lifecycle,
plus products, CMS, chatbot, dashboard) and closed the remaining gaps.

## Fixed
- **Login page leaked admin credentials** in a visible box shown to every
  visitor. Removed.
- **Customer "My Orders" now exists** — new `/my-orders` page with per-order
  status progress bar, wired into the navbar (desktop + mobile) and the order
  success page. Backed by `GET /api/orders/my`.
- **Payment lifecycle completed** — admins can mark an order Paid / Pending /
  Failed from the order panel (`PUT /api/orders/:id/payment`). Suits the
  manual bKash/Nagad/COD confirmation model used by most BD stores.
- Checkout **prefills name and email** for logged-in users, and the order
  attaches to their account so it appears in My Orders.
- Cart: fixed **double ৳** in the free-shipping hint and the always-appended
  "..." on short product names.
- ProductDetail thumbnail strip now uses `mediaUrl()`.

## Verified working (no change needed)
Browse/filter/search, product detail, add-to-cart, cart math, checkout,
order placement, admin order lifecycle (status dropdown + buttons: new →
confirmed → processing → shipped → delivered/cancelled), add/edit/delete
product, categories CMS, chatbot → messages → admin inbox, dashboard stats
+ calendar + charts.

## Payment gateways — scope note
Real automated bKash/Nagad/card gateways require merchant credentials and
their SDK/sandbox, so they are not integrated. The store records the chosen
method and the admin confirms payment manually (standard for small BD
e-commerce). Wiring a gateway later is isolated to the checkout + a webhook.

---

# Round 3 — Deeper review

Two more real issues found on a closer pass:
- **Registration didn't log the user in.** Register stored the token but never
  updated auth state, so a new user appeared logged out (and their order wasn't
  linked to their account) until a manual refresh. Added `register()` to
  AuthContext; Register now uses it.
- **Order-number collision risk.** `orderNumber` was timestamp-only with a
  unique index, so two orders in the same millisecond would fail. Added a
  3-digit random suffix.

Verified: AuthContext (login/register/logout), Register, CartContext
(localStorage persistence), messages/chatbot flow, dashboard stats, and all
API method names match their usage.

---

# Round 4 — Chat, messaging, filters, spacing

## Chat widget
- **Fixed layering**: chat window now sits above the navbar (was hidden behind
  it). z-index raised above the sticky nav.
- **Click anywhere outside to close** via a backdrop — no longer only the ×.
- Rebuilt as a **two-way WhatsApp-style thread**: the customer's messages and
  the store's replies appear as chat bubbles, it polls for new replies every
  5s, and the conversation persists (localStorage) so a returning visitor sees
  their history. Mobile view goes full-screen.

## Admin messaging (WhatsApp-style, both ends)
- New **Conversation** model (threaded, keyed by phone number).
- AdminMessages rewritten as a **two-pane messenger**: conversation list on the
  left (with unread badges + search), full chat thread on the right with a
  reply composer. Admin replies flow back to the customer's chat widget.
- Endpoints: `POST /messages` (start/continue), `GET /messages/thread/:id`
  (customer poll), `GET /messages` (list), `GET /messages/:id` (thread),
  `POST /messages/:id/reply`, `DELETE /messages/:id`.
- **Legacy messages are migrated** into conversations on first boot (grouped by
  phone), so existing enquiries show up in the new UI.

## Subcategory filters
- Products now carry a **subcategory** (Router, Switch, Firewall, Access Point,
  NAS/Storage, IP Camera, Antivirus, etc.), inferred from the product
  name/tags. Existing products are **backfilled on boot**; new/edited products
  are inferred automatically.
- `GET /products/facets` returns which subcategories exist under each category
  and brand (computed live, so filters always match real inventory).
- The Products sidebar now **expands subcategories** under the selected
  category or brand, with counts, and they show as removable filter tags.

## Spacing
- Tightened the products layout gap/padding and added compact sub-filter
  styling. (Spacing is subjective — point me at any specific screen that still
  feels off and I'll tune that spot.)

---

# Round 5 — Best Buy–style redesign + Global Brand catalog

## Design
- Reworked the visual system to a Best Buy–**inspired** retail look: blue
  (#0046BE) + yellow (#FFE000) on white, Inter typography, pill buttons,
  rounded white product cards with borders (replacing the hairline grid).
- New blue header with a clean GIGEXA wordmark, white pill search with a yellow
  search button, blue category bar, yellow promo strip.
- Rebuilt the homepage: rotating hero, trust bar, category tiles, New Arrivals
  and Featured rows, brand strip, corporate CTA.
- Note: this is an original design *inspired by* Best Buy's layout and colour
  language — it does not copy Best Buy's logo, trademarked tag, or assets.

## Catalog (from globalbrand.com.bd)
- Replaced the seed with Global Brand's real categories (Laptop, Desktop & PC,
  Monitor, Components, Accessories, Gaming, Networking, Printer, TV & Display,
  Gadgets), real brands (ASUS, Lenovo, Dell, HP, Acer, MikroTik, Cisco, Cudy,
  Starlink, Rapoo, Cooler Master, Lexar, Brother, Realview, Blisbond, Hohem…)
  and ~22 real products with real BDT prices (e.g. ASUS Vivobook S14 ৳134,000,
  Lenovo Yoga Slim 7i Ultra ৳315,000, Cudy WR1200 ৳2,650, Starlink Standard
  ৳49,500, Brother DCP-T220 ৳16,500).
- Product **names, specs and prices are factual**; descriptions were written
  fresh (not copied). Product photos are representative Unsplash images, not
  Global Brand's own photos.
- Subcategory inference extended for the new types (Laptop, Graphics Card, CPU
  Cooler, Keyboard, Controller, Speaker, Projector, Gimbal, Router, Printer…).

## Auto-apply on existing DBs
- The seed now carries a CATALOG_VERSION. On next backend start it detects the
  old catalog and **re-seeds automatically** (orders keep their own copies of
  product name/price/thumbnail, so past orders are unaffected).

## Messaging
- The two-way WhatsApp-style chat (customer widget + admin messenger) is kept
  and unchanged.

---

# Round 6 — Speed + polish

## Speed
- **Code-split the admin panel** (React.lazy + Suspense). The customer-facing
  JS bundle dropped from ~212 kB to ~94 kB gzipped; the charts library and admin
  screens now load only when an admin opens /admin.
- Product images use `loading="lazy"` + `decoding="async"` so the grid paints
  faster and only loads images as you scroll.
- Added MongoDB indexes on the product fields the storefront filters/sorts by
  (category, brand, subcategory, isFeatured, isNewArrival, createdAt) — faster
  queries as the catalog grows.

## Polish
- Fixed the invisible **"Email Us"** button (was white text on the dark CTA);
  it's now a solid white button with dark text.
- Replaced the mismatched old teal/purple **footer logo** with a clean GIGEXA
  wordmark (GIG white, EXA accent) matching the header.

## Filter fix
- Clicking a sidebar category/brand/subcategory now clears any leftover text
  search, so browse results and the sidebar counts always agree (no more
  "count says 1 but shows 0 products").
