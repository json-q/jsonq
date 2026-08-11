/**
 * 将博客文章中的外链图片下载到本地并改写 markdown 引用。
 *
 * 目标结构：图片放在文章同目录的 assets/<文章名>/ 下
 *   src/blog/components/rc-template/component-build.md
 *     -> src/blog/components/rc-template/assets/component-build/<原文件名>
 *
 * markdown 引用改写为相对路径（./assets/<文章名>/xxx.png），由 Astro 内容集合自动解析并优化。
 *
 * 幂等：已本地化的引用（./assets/...）不会被再次改写。
 *
 * 用法：node scripts/migrate-images.mjs
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "src", "blog");
const CONCURRENCY = 8;

// 仅匹配 markdown 图片语法中的 http(s) 外链（可选 title 属性），避免误伤代码示例
const IMG_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith(".md")) yield full;
  }
}

/** 从魔数推断图片真实类型 */
const MAGIC = [
  { ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "gif", test: (b) => b.toString("latin1", 0, 4) === "GIF8" },
  { ext: "jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "webp", test: (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP" },
  { ext: "avif", test: (b) => b.toString("latin1", 4, 8) === "ftyp" },
  { ext: "svg", test: (b) => /<svg[\s>]/i.test(b.toString("latin1", 0, 512)) },
];
function detectType(buf) {
  for (const { ext, test } of MAGIC) if (test(buf)) return ext;
  return null;
}

async function download(url, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const detected = detectType(buf);
      if (!detected) throw new Error(`无法识别的图片内容 (${buf.length} bytes)`);
      return { data: buf, ext: detected };
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/** 保留原 CDN 文件名，仅保证扩展名与真实类型一致 */
function pickFilename(url, ext) {
  const basename = path.posix.basename(new URL(url).pathname).split("?")[0] || "image";
  const parsed = path.parse(basename);
  const claimed = parsed.ext.replace(/^\./, "").toLowerCase();
  if (parsed.name && (claimed === ext || (claimed === "jpg" && ext === "jpeg"))) return basename;
  return `${parsed.name || "image"}.${ext}`;
}

function normalizeUrl(u) {
  return u.replace(/\/$/, "").split("#")[0];
}

/** 文章专属图片目录：src/blog/vue/vue-tsx.md -> src/blog/vue/assets/vue-tsx/ */
function imageTargetDir(file) {
  const article = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), "assets", article);
}

// ---- 第一步：收集外链图片引用 ----
const refsByFile = new Map(); // file -> {url, alt}[]
for (const file of walk(BLOG_DIR)) {
  const content = readFileSync(file, "utf8");
  for (const m of content.matchAll(IMG_RE)) {
    const url = normalizeUrl(m[2]);
    if (!refsByFile.has(file)) refsByFile.set(file, []);
    refsByFile.get(file).push({ url, alt: m[1] });
  }
}
const uniqueUrls = [...new Set([...refsByFile.values()].flat().map((r) => r.url))];
const totalRefs = [...refsByFile.values()].reduce((a, r) => a + r.length, 0);
console.log(`发现 ${refsByFile.size} 个文件 / ${totalRefs} 处引用 / ${uniqueUrls.length} 个唯一 URL`);

// ---- 第二步：下载到本地 ----
const targetByUrl = new Map(); // url -> { dir, filename?, data? }
for (const [file, refs] of refsByFile) {
  const dir = imageTargetDir(file);
  for (const { url } of refs) {
    if (!targetByUrl.has(url)) targetByUrl.set(url, { dir });
  }
}

const queue = [...uniqueUrls];
let done = 0;
const failedUrls = [];

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const { dir } = targetByUrl.get(url);
    try {
      const { data, ext } = await download(url);
      targetByUrl.set(url, { dir, filename: pickFilename(url, ext), data });
      done++;
      if (done % 50 === 0) console.log(`  下载 ${done}/${uniqueUrls.length} ...`);
    } catch (e) {
      failedUrls.push(url);
      console.error(`  ✗ 失败 [${e.message}] ${url}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

let totalBytes = 0;
for (const url of uniqueUrls) {
  const { dir, filename, data } = targetByUrl.get(url);
  if (!filename || !data) continue; // 下载失败的保留外链
  const targetAbs = path.join(dir, filename);
  mkdirSync(dir, { recursive: true });
  const existing = statSync(targetAbs, { throwIfNoEntry: false });
  if (!existing || existing.size !== data.length) writeFileSync(targetAbs, data);
  totalBytes += data.length;
}
console.log(`下载完成: 成功 ${done} / ${failedUrls.length} 失败, 总大小 ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

// ---- 第三步：改写 markdown（单遍替换，保留下载失败的为外链）----
let rewrittenFiles = 0;
let rewrittenRefs = 0;
for (const [file] of refsByFile) {
  const content = readFileSync(file, "utf8");
  let replaced = 0;
  const newContent = content.replace(IMG_RE, (full, alt, rawUrl) => {
    const url = normalizeUrl(rawUrl);
    const entry = targetByUrl.get(url);
    if (!entry?.filename) return full;
    const targetAbs = path.join(entry.dir, entry.filename);
    let rel = path.relative(path.dirname(file), targetAbs).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    replaced++;
    return `![${alt}](${rel})`;
  });
  if (replaced > 0) {
    writeFileSync(file, newContent);
    rewrittenFiles++;
    rewrittenRefs += replaced;
  }
}
console.log(`改写完成: ${rewrittenFiles} 个文件 / ${rewrittenRefs} 处引用`);

// ---- 第四步：验证 ----
let remaining = 0;
for (const file of walk(BLOG_DIR)) {
  const content = readFileSync(file, "utf8");
  for (const m of content.matchAll(IMG_RE)) {
    remaining++;
    console.log(`  ✗ 仍为外链: ${file} -> ${m[2]}`);
  }
}
console.log(`剩余外链引用: ${remaining}`);

let missing = 0;
for (const file of walk(BLOG_DIR)) {
  const content = readFileSync(file, "utf8");
  const localImg = /!\[[^\]]*\]\(([^)]+)\)/g;
  for (const m of content.matchAll(localImg)) {
    const ref = m[1].split(/\s+/)[0].trim();
    if (/^https?:\/\//.test(ref)) continue;
    const abs = path.resolve(path.dirname(file), ref);
    if (!statSync(abs, { throwIfNoEntry: false })) {
      missing++;
      console.log(`  ✗ 本地图片不存在: ${file} -> ${ref}`);
    }
  }
}
console.log(`本地引用校验: ${missing === 0 ? "全部通过 ✓" : `${missing} 处缺失 ✗`}`);
if (failedUrls.length) console.log("下载失败、仍保留外链的 URL:", failedUrls);
