const fs = require("fs");
const path = require("path");

const root = __dirname;
const output = path.join(root, "dist");
const files = [
  "index.html",
  "styles.css",
  "game.js",
  "config.js",
  "04dfb06830873a21f6daf971ffd28f0e.jpg",
  "08b4591f8e5cb8d5faec750020e7a1e3.jpg",
  "1ae729b50ffeff163d8c03fc21563cb1.jpg",
  "3e55bda70492fdb9cf76d34b0b791bea.jpg",
  "5eda06b930ed820d7c535ca94c9e7c27.jpg",
  "652ee6d03b6bd9d2ae22209e72dfb88b.jpg",
  "9146d2a65b762451054f1782e434097b.jpg",
  "9342fded92b465f6ab098c8903254faa.jpg",
  "e59672bc971d25f0abef9057f404bc7f.jpg",
  "04dfb06830873a21f6daf971ffd28f0e.jpg"
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
