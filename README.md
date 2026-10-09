# Shoppe

A static jewelry storefront built with HTML, CSS, Bootstrap and vanilla JavaScript.

## Run locally

From this folder, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/index.html in your browser. Bootstrap, icons and fonts currently require an internet connection.

## Working features

- Catalog links open the selected product using `product.html?id=...`.
- Search, category, maximum price, sale filter and price sorting work together.
- Cart supports quantities, removal, subtotals and persistence in localStorage. Quantities are limited to 1–99 per product.
- Form validation includes required fields, email validation and matching registration passwords.
- Blog comments are shown as page previews using textContent; they are not saved or published.
- Shared styles improve mobile forms, touch cart buttons, keyboard focus and reduced-motion support.

## Services still needed

There is no backend, authentication, checkout, email provider or inventory API. Account, contact, newsletter and password recovery forms explicitly report that nothing was sent. Passwords are never stored. Cart persistence depends on browser storage being available.

Shipping policies, terms and social URLs have not been supplied; these links show an unavailable notice. Editorial content contains template text that should be replaced with approved store content before publishing.

The sale badges are existing demo catalog data, not verified live discounts. Product prices have been made consistent with the home page; confirm them before launch. Product specifications and unrelated thumbnail images were removed from the detail view because accurate per-product information was not supplied.

## Validation

Checked JavaScript syntax, local file references, search/category behavior, selected-product details, cart subtotal and reload persistence, registration mismatch validation and mobile layout/menu behavior.
