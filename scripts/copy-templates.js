const fs = require("node:fs");
const path = require("node:path");

const src = path.resolve(__dirname, "..", "src", "templates");
const dest = path.resolve(__dirname, "..", "dist", "templates");

function copyDir(s, d) {
  fs.mkdirSync(d, { recursive: true });
  for (const entry of fs.readdirSync(s, { withFileTypes: true })) {
    const sp = path.join(s, entry.name);
    const dp = path.join(d, entry.name);
    if (entry.isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

if (!fs.existsSync(src)) {
  console.error("templates source missing:", src);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);
console.log("copied templates ->", dest);
