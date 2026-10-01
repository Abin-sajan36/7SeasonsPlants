# 7Seasonsplants Database & Content Backup

This directory contains a complete backup of all database collections and content from the **7Seasonsplants** application.

## Backup Contents

### Live Firestore Collections (JSON)
- `full_database_backup.json`: Consolidated master export of all Firestore database collections.
- `combos.json`: All plant combo packs and arrangements.
- `products.json`: Plant products catalog.
- `categories.json`: Categories taxonomy and configurations.
- `dailyDeals.json`: Active daily deals and promotional discounts.
- `coupons.json`: Promo discount codes and redemption rules.
- `banners.json`: Hero banners, seasonal advertisements, and dispatch alerts.
- `plantCareGuides.json`: Botanical care instructions, light, watering, and soil guidance.
- `blogs.json`: Nursery gardening blogs and articles.
- `users.json`: Customer profiles, addresses, and account details.
- `orders.json`: Customer order history, shipping addresses, tracking, and payment details.
- `storeSettings.json`: Store operational settings (WhatsApp contact, delivery charges, free delivery thresholds, state shipping restrictions).

### Seed & Fallback Data (JSON)
- `seed_reviews.json`: Customer reviews, ratings, and verified buyer testimonials.
- `seed_products.json`: Core plant catalog with full botanical specifications.
- `seed_combos.json`: Combo packages with pricing, discounts, and items.
- `seed_categories.json`: Plant category hierarchy.
- `seed_daily_deals.json`: Initial daily deal bundles.
- `seed_coupons.json`: Standard coupon codes.
- `seed_banners.json`: Original hero banners.
- `seed_plant_care_guides.json`: Standard care guide data.
- `seed_blogs.json`: Pre-configured educational plant blogs.
- `seed_store_settings.json`: Default operational parameters.

## Restoring Data to Firestore
You can restore or migrate this data to any Firebase project:
1. Ensure your `firebase-applet-config.json` points to your target Firebase project.
2. The JSON files can be imported directly using the Firebase Admin SDK or custom Node.js script.
