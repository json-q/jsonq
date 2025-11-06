import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE } from "@/config";
import { genPath } from "@/utils/genPath";
import getSortedPosts from "@/utils/getSortedPosts";

export async function GET() {
  const posts = await getCollection("blog");

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: getSortedPosts(posts).map(({ data, id, filePath }) => ({
      link: genPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.updatedDate ?? data.pubDate),
    })),
  });
}
