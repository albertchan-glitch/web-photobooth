import { PNG } from "npm:pngjs@7.0.0";
import fs from "node:fs";

const dir = "C:/Users/Albert/.gemini/antigravity/scratch/web-photobooth/public/frames";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".png")).sort();

const templates = ["3slots", "4slots", "landscape", "mini", "square"];

const result = {};

for (const tmpl of templates) {
  result[tmpl] = [];
  const tmplFiles = files.filter(f => f.startsWith(`${tmpl}_`));
  for (const f of tmplFiles) {
    const data = fs.readFileSync(`${dir}/${f}`);
    const png = PNG.sync.read(data);
    const { width, height } = png;
    
    // Sample non-transparent pixels to find average/representative color
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    // Sample top, bottom, and edges
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        const idx = (width * y + x) << 2;
        const a = png.data[idx + 3];
        if (a > 200) {
          rSum += png.data[idx];
          gSum += png.data[idx + 1];
          bSum += png.data[idx + 2];
          count++;
        }
      }
    }
    const r = count ? Math.round(rSum / count) : 255;
    const g = count ? Math.round(gSum / count) : 255;
    const b = count ? Math.round(bSum / count) : 255;
    
    const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    
    // Also sample border edge
    const edgeIdx = ((width * 5) + 5) << 2;
    const edgeHex = "#" + [png.data[edgeIdx], png.data[edgeIdx+1], png.data[edgeIdx+2]].map(x => x.toString(16).padStart(2, '0')).join('');
    
    result[tmpl].push({
      file: f,
      width,
      height,
      avgColor: hex,
      edgeColor: edgeHex
    });
  }
}

console.log(JSON.stringify(result, null, 2));
