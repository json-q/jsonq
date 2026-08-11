/**
 * 将 assets 目录进一步细分为 <文章名>/ 子目录：
 *
 *   src/blog/components/impl-responsive-observe.md
 *     -> src/blog/components/assets/impl-responsive-observe/xxx.png
 *   引用改写为 ./assets/impl-responsive-observe/xxx.png
 *
 * 以 markdown 引用为归属依据：每张图片只属于引用它的那篇文章。
 * 幂等：已细分（路径含 / ）的引用跳过。
 *
 * 用法：node scripts/refactor-assets.mjs
 */
import { mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "src", "blog");

// 本地化图片引用：![alt](./assets/<filename>)
const LOCAL_IMG_RE = /!\[([^\]]*)\]\(\.\/assets\/([^)]+)\)/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith(".md")) yield full;
  }
}

function pathExists(p) {
  return statSync(p, { throwIfNoEntry: false }) !== undefined;
}

let movedFiles = 0;
let movedRefs = 0;

for (const file of walk(BLOG_DIR)) {
  const article = path.basename(file, path.extname(file));
  const content = readFileSync(file, "utf8");
  const matches = [...content.matchAll(LOCAL_IMG_RE)];
  if (matches.length === 0) continue;

  const assetsDir = path.join(path.dirname(file), "assets");
  const targetDir = path.join(assetsDir, article);

  // 1) 移动文件
  const seen = new Set();
  for (const m of matches) {
    const filename = m[2].trim();
    if (seen.has(filename)) continue;
    seen.add(filename);
    const src = path.join(assetsDir, filename);
    const dst = path.join(targetDir, filename);
    if (!pathExists(src)) {
      console.warn(`  ⚠ 源文件不存在: ${src}`);
      continue;
    }
    mkdirSync(targetDir, { recursive: true });
    renameSync(src, dst);
    movedFiles++;
  }

  // 2) 改写引用
  let replaced = 0;
  const newContent = content.replace(LOCAL_IMG_RE, (full, alt, filename) => {
    const trimmed = filename.trim();
    if (trimmed.includes("/")) return full; // 已细分，跳过
    replaced++;
    return `![${alt}](./assets/${article}/${trimmed})`;
  });
  if (replaced > 0) {
    writeFileSync(file, newContent);
    movedRefs += replaced;
  }
}

console.log(`细分完成: 移动 ${movedFiles} 张图片, 改写 ${movedRefs} 处引用`);
