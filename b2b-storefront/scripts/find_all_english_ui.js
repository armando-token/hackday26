const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".next") && !file.includes(".git")) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk("/home/ubuntu/CN_Web/b2b-storefront/src");

// Phrases / words that should be in Spanish
const englishTerms = [
  "Sign in", "Sign out", "Log in", "Log out", "Create account", "Forgot password", "Reset password",
  "Add to cart", "Shopping Cart", "Order summary", "Subtotal", "Shipping", "Discount", "Promo code",
  "Quick Order", "Search products", "All categories", "View all", "See more", "Read more", "Show more",
  "Show less", "Clear all", "Sort by", "In stock", "Out of stock", "Quantity", "Recently viewed",
  "Request Quote", "Get a Quote", "Billing address", "Shipping address", "Payment method", "Review order",
  "Order confirmed", "Thank you", "Loading...", "No results", "Something went wrong", "Page not found",
  "First name", "Last name", "Address", "Postal code", "City", "Country", "Phone", "Company",
  "Select a payment method", "Select", "Continue to", "Back to", "Proceed to", "Save changes",
  "Product Details", "Documents", "Technical Details", "Specifications", "Price: Low -> High", "Price: High -> Low",
  "Price: Low to High", "Price: High to Low", "Country of Origin", "Warranty", "1-Year Manufacturer Warranty",
  "Mfr. Model", "Item Number", "Catalog Page", "Free Shipping", "Medusa Store", "Medusa Next.js",
  "Starter Template", "Welcome back", "Profile", "Addresses", "Orders", "Overview", "Saved items",
  "Delivery", "Step", "Items", "Item", "Total", "Original", "Calculated at checkout",
  "Taxes", "Taxes and shipping", "Apply", "Remove", "Edit", "Delete", "Cancel", "Save", "Submit",
  "Explore", "Featured products", "Latest products", "Popular products", "Related Products",
  "Select variant", "Select option", "Out of stock", "In Stock", "Only", "left in stock"
];

const found = [];

files.forEach(file => {
  const rel = file.replace("/home/ubuntu/CN_Web/b2b-storefront/", "");
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const raw = line.trim();
    if (raw.startsWith("import ") || raw.startsWith("//") || raw.startsWith("/*") || raw.startsWith("*")) return;

    englishTerms.forEach(term => {
      // Case insensitive match but avoid matching variable names like `cart` unless whole word or exact
      const regex = new RegExp(`(?<![a-zA-Z0-9_])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-zA-Z0-9_])`, "i");
      if (regex.test(raw)) {
        found.push({
          file: rel,
          line: idx + 1,
          term: term,
          code: raw
        });
      }
    });
  });
});

console.log(`Total exact term matches: ${found.length}\n`);

// Group by file
const byFile = {};
found.forEach(item => {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
});

for (const [file, items] of Object.entries(byFile)) {
  console.log(`\n========================================`);
  console.log(`📄 ${file} (${items.length} items):`);
  items.forEach(i => {
    console.log(`  L${i.line} [${i.term}] ${i.code}`);
  });
}
