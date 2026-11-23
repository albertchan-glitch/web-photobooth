import { PNG } from "npm:pngjs@7.0.0";
import fs from "node:fs";

const dir = "C:/Users/Albert/.gemini/antigravity/scratch/web-photobooth/public/frames";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".png")).sort();

for (const f of files) {
  const p = `${dir}/${f}`;
  const data = fs.readFileSync(p);
  const png = PNG.sync.read(data);
  // Sample dominant / corner colors
  const idx0 = 0; // top-left
  const idxCenterBottom = ((png.height - 15) * png.width + Math.floor(png.width / 2)) << 2;
  const c0 = `rgba(${png.data[idx0]},${png.data[idx0+1]},${png.data[idx0+2]},${png.data[idx0+3]})`;
  const cb = `rgba(${png.data[idxCenterBottom]},${png.data[idxCenterBottom+1]},${png.data[idxCenterBottom+2]},${png.data[idxCenterBottom+3]})`;
  console.log(`${f.padEnd(16)}: ${png.width}x${png.height}, corner=${c0}, bottom=${cb}`);
}
