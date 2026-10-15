## Prepared hoodie collection

Use the prepared-design picker for FORGIVEN or ACTION / WORSHIP / ENCOURAGE. Both repeat their wording down both sleeves and include Ephesians 2:8–9 (KJV), the AWE Faith app QR code and a recreated A.W.E. Missions front logo. See [design notes](designs/README.md) for print limitations and remaining account steps. Planning prices are estimates.

# AweFaith / AweMissions Merch Studio

A local Windows merchandise utility. No npm installation, subscription, OpenAI key or AI API usage is required by this utility. Existing ChatGPT plan limits, Shopify charges, Printful fulfillment, payment processing, taxes and shipping still apply.

## Start

Double-click **Start Studio.cmd**. Keep the terminal window open while working. The studio opens at http://127.0.0.1:4178. Node.js 22 or newer is required (already available on the computer where this was built). Close the terminal to stop the service. Keep the app folder together; do not open index.html directly.

## Create merchandise

1. Import a PNG, JPG or WebP. Transparent PNG is preferred. Use artwork you own or have permission to reproduce on merchandise.
2. For image changes, describe them under “Your creative partner,” copy the prompt, open ChatGPT, and attach the reference. Import the finished result here. ChatGPT is a separate manual step; there are no automated ChatGPT calls or AI fees from this utility.
3. Adjust front/back/sleeve image placement, text, font and ink. Drag the image on the preview or use sliders. The preview is an illustration, not a Printful production mockup.
4. Select colors, sizes, title, description and price. Offline mode uses a **planning** print area (12 × 16 inches at 300 DPI), not a garment specification. Connect Printful and select a garment to load actual dimensions and variants before sending a product.
5. Save your project as a .awefaith.json file. Local browser autosave also keeps the most recent project. Project files embed the original images but never contain credentials. Reopening a project requires revalidating its garment against the live catalog.
6. Export the current side's transparent Print PNG, the illustrative Preview PNG, and/or the Shopify draft CSV. Import the CSV in Shopify if you prefer the manual route, then configure Printful fulfillment and add real product mockups.

## Connect accounts for automation

Click the gear at the bottom of the left rail. Credentials are sent only to the service on your computer and to their respective provider; they stay in server memory until it stops or you disconnect. They are not written to disk or browser storage. The service binds only to 127.0.0.1 and rejects cross-origin requests. Do not expose it to the internet.

### Shopify

Create and install a custom app through the Shopify Dev Dashboard in the same organization that owns your store. Give it `read_products`, `write_products`, `read_files`, and `write_files` scopes. Enter the store's **myshopify.com** domain (not awemissions.org), app client ID and client secret into the local utility. It exchanges these for a session access token. Shopify's client-credentials tokens typically expire after 24 hours; reconnect when needed. Existing legacy Admin API access tokens can be entered in the expandable legacy field instead.

Official setup: https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant

### Printful

Create a private token in https://developers.printful.com/login with access to your Shopify-connected store and scopes allowing store listing, product/catalog reads, and ecommerce sync reads/writes. Find your stores in the utility and select the Shopify-connected store that matches the Shopify account.

Official API documentation: https://developers.printful.com/docs/

## Automated product handoff

1. Connect both accounts and load the Printful catalog. Choose T-shirt, Sweatshirt / crewneck, or Hoodie under Product type, then select a live garment and supported colors/sizes. Switching product type keeps your artwork, resets garment verification and updates the illustrative silhouette. Shopify drafts and CSV exports use the selected product type. Prices and base costs stay as your estimates; review them when changing garments. The utility retrieves variant IDs and print-file templates. Combinations with different print dimensions must be split into separate projects. This version supports front raster artwork with optional back, left sleeve and right sleeve artwork, checked against each live variant template. Embroidery, labels, DTFlex technique selection and all-over products should be configured in Printful's editor.
2. Confirm the source-artwork rights checkbox and review the product. The utility checks source resolution using its on-canvas placement; low-resolution sources below 150 effective DPI block live draft creation. This is a general guard, not a guarantee that Printful will accept the file.
3. Approve creating a draft. The utility uploads front/back/sleeve print files and one illustrative four-area contact sheet to Shopify Files, then creates a new Shopify product with its color/size variants, descriptions, SKUs and prices. The product remains **DRAFT**, with tracked zero inventory and overselling disabled. There is no paid order submission or automatic public launch.
4. Confirm the target Printful store and select **Map draft variants to Printful**. The utility looks up the Shopify product imported into Printful and assigns exact catalog variant IDs and print files to matching external variant IDs. Results are shown separately for each variant. It verifies Printful's sync flag after each update.
5. Printful may not import a Shopify draft automatically. Refresh/import products in Printful, then retry. If the connected store won't import drafts, finish setup through Printful's product editor. The utility never makes the product active to force synchronization. Partial mapping is reported and retryable, not claimed as complete.
6. In Printful, check actual placement, generate real mockups, verify availability and costs, and confirm Shopify fulfillment/inventory/shipping configuration. Replace the illustrative preview in Shopify with production mockups. Publish in Shopify only after completing these checks. Your existing Shopify/Printful integration handles fulfillment after proper setup.

Live Shopify writes, image uploads and Printful mapping still require your account connections and have not been exercised against your accounts. Seven automated tests passed, including the existing draft workflow and new four-area mapping, missing/mismatched sleeve guards and preset QR/sleeve size checks. Browser checks passed for both presets, both sleeve tabs, print PNG downloads, four-area save and legacy project migration, with no browser errors. QR payloads were independently decoded, and the destination returned HTTP 200. Physical garment scanning and Printful production mockups remain pending.

## Limits and recovery

- No generative AI runs inside the utility. You use ChatGPT separately, within your existing plan's availability and limits.
- Source imports: 20 MB and 40 megapixels maximum. Export templates: up to 6500 × 6500 pixels. Imported SVG, PDFs, layered design files and remote image URLs are not supported; export a raster PNG first.
- Print PNGs contain transparent pixels at the required pixel dimensions. Browser PNG metadata may say 96 DPI; placement is determined by pixels and the actual Printful template. Do not use metadata alone to determine physical size.
- One image and one multiline text layer per area, including both sleeves. No background removal, recoloring, cropping or AI image editing inside the utility.
- Browser autosave is local to this origin. Save a project file for backup or transfer.
- Avoid changing a design during a live operation. Editing after draft creation starts a new project ID and creates a separate draft on the next handoff. Existing Shopify drafts are never silently overwritten.
- Provider failures may leave uploaded files in Shopify Files. Review Files and products before retrying after an uncertain network failure; do not assume a failed response means the remote action did not happen.
- Sync receipts and credentials last only for the current local service session. Saved project files do not restore a remote draft mapping session.
- Hostinger DNS and awemissions.org configuration are not changed by this utility.

## Maintenance

Run `npm test` for product/CSV checks. The application uses only Node.js built-in modules; no package download is needed. It targets Shopify Admin GraphQL API 2026-10 and Printful API v1 ecommerce sync endpoints. Keep Node.js updated.
