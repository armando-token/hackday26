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

const folders = ["cart", "checkout", "layout", "order", "products", "store", "home", "search", "common", "account"];

folders.forEach(mod => {
  const p = path.join("/home/ubuntu/CN_Web/b2b-storefront/src/modules", mod);
  if (!fs.existsSync(p)) return;
  const files = walk(p);
  console.log(`\n======================================================`);
  console.log(`>>> MODULE: ${mod.toUpperCase()}`);
  console.log(`======================================================`);
  
  files.forEach(f => {
    const rel = f.replace("/home/ubuntu/CN_Web/b2b-storefront/", "");
    const content = fs.readFileSync(f, "utf8");
    const lines = content.split("\n");
    const matchedLines = [];

    lines.forEach((line, idx) => {
      const raw = line.trim();
      if (raw.startsWith("import ") || raw.startsWith("//") || raw.startsWith("/*") || raw.startsWith("*")) return;
      // Match English patterns
      if (
        /\b(cart|shopping|checkout|order|orders|shipping|billing|payment|discount|promo|summary|subtotal|total|taxes|tax|price|item|items|quantity|qty|sign in|sign out|log in|log out|register|create account|forgot password|profile|overview|addresses|address|saved|edit|delete|remove|save|cancel|apply|submit|back|next|previous|continue|review|details|specifications|documents|downloads|manual|datasheet|warranty|mfr|model|brand|category|categories|search|results|found|filter|filters|sort by|low|high|stock|availability|only|away|unlocked|unlock|free|view|viewed|recently|request|quote|help|questions|welcome|hello|completed|transfer|please|enter|select|choose|country of origin|product details)\b/i.test(raw)
      ) {
        // Filter out lines that are purely typescript declarations or purely CSS classes without text
        if (!raw.startsWith("export type") && !raw.startsWith("type ") && !raw.startsWith("interface ") && !raw.startsWith("export interface") && !raw.startsWith("const [") && !raw.startsWith("const {") && !raw.startsWith("let ") && !raw.startsWith("var ") && !raw.startsWith("return fetch") && !raw.startsWith("import")) {
          // Check if there is actual english text string
          matchedLines.push({ lineNum: idx + 1, text: raw });
        }
      }
    });

    if (matchedLines.length > 0) {
      console.log(`\n📄 ${rel} (${matchedLines.length} candidate lines)`);
      matchedLines.forEach(m => console.log(`  L${m.lineNum}: ${m.text}`));
    }
  });
});
