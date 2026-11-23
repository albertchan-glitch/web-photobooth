import { PNG } from "npm:pngjs@7.0.0";
import fs from "node:fs";

const p = "C:/Users/Albert/.gemini/antigravity/scratch/web-photobooth/public/frames/4slots_1.png";
const data = fs.readFileSync(p);
const png = PNG.sync.read(data);
const { width, height } = png;

console.log(`4slots_1.png: ${width}x${height}`);

// Check transparent pixels in 4slots_1.png
const rowHasTrans = new Array(height).fill(false);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    if (png.data[idx + 3] < 128) {
      rowHasTrans[y] = true;
      break;
    }
  }
}

const intervals = [];
let inInterval = false;
let startY = 0;
for (let y = 0; y < height; y++) {
  if (rowHasTrans[y] && !inInterval) {
    inInterval = true;
    startY = y;
  } else if (!rowHasTrans[y] && inInterval) {
    inInterval = false;
    intervals.push({ startY, endY: y - 1 });
  }
}
if (inInterval) intervals.push({ startY, endY: height - 1 });

console.log(`Found ${intervals.length} transparent slot intervals:`);
intervals.forEach((inv, i) => {
  console.log(`  Slot ${i+1}: Y=[${inv.startY}, ${inv.endY}], height=${inv.endY - inv.startY + 1}, Y%=[${(inv.startY/height*100).toFixed(1)}%, ${(inv.endY/height*100).toFixed(1)}%]`);
});
