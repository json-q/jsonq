import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * @param id blog 下的文件路径，例 `dev/pnp-local-link-sharepoint`
 * @param filePath 完整文件路径，例 `src/blog/dev/pnp-local-link-sharepoint.md`
 * @param includeBase - 生成的路径是否以 `/posts` 开头
 * @returns string
 */
export function genPath(id: string, filePath?: string, includeBase = true) {
  // 获取文件分段路径（不包含文件名）
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter((path) => path !== "")
    .filter((path) => !path.startsWith("_")) // 以 "_" 开头的路径不会被计入 url path 拼接
    .slice(0, -1) // 移除文件名
    .map((segment) => slugifyStr(segment)); // 名字统一 kababcase 处理

  const prefixPath = includeBase ? "/posts" : "";

  // 取文章名 slug : "my" -> ["my"] -> "my"
  const slug = id.split("/").slice(-1);

  // pathSegments 不存在，即没有二级目录，直接就是 /posts/[slug]
  if (!pathSegments || pathSegments.length < 1) {
    return [prefixPath, slug].join("/");
  }

  return [prefixPath, ...pathSegments, slug].join("/");
}
