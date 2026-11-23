// Deno Dual HTTP + HTTPS Server for Web Photobooth
import { serveDir } from "jsr:@std/http/file-server";
import fs from "node:fs";
import path from "node:path";

const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;
const ROOT = "C:/Users/Albert/.gemini/antigravity/scratch/web-photobooth";

const handler = (req) => {
  return serveDir(req, {
    fsRoot: ROOT,
    showDirListing: false,
    enableCors: true,
  });
};

// 1. 启动普通 HTTP 服务 (端口 3000)
Deno.serve({ port: HTTP_PORT, hostname: "0.0.0.0" }, handler);

// 2. 启动加密 HTTPS 服务 (端口 3443，使手机浏览器能在安全上下文中直接调用摄像头)
const certPath = path.join(ROOT, "certs", "cert.pem");
const keyPath = path.join(ROOT, "certs", "key.pem");

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const cert = fs.readFileSync(certPath, "utf-8");
  const key = fs.readFileSync(keyPath, "utf-8");

  Deno.serve(
    {
      port: HTTPS_PORT,
      hostname: "0.0.0.0",
      cert,
      key,
    },
    handler
  );
  console.log(`🔒 HTTPS 服务已启动 (手机摄像头推荐):`);
  console.log(`   - 手机浏览器访问: https://192.168.26.28:${HTTPS_PORT}`);
  console.log(`   - 本地电脑访问:   https://localhost:${HTTPS_PORT}`);
}

console.log(`🌐 HTTP 服务已启动:`);
console.log(`   - 本地电脑访问:   http://localhost:${HTTP_PORT}`);
console.log(`   - 手机浏览器访问: http://192.168.26.28:${HTTP_PORT}`);
