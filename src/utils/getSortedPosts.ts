import type { CollectionEntry } from "astro:content";

const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts.sort(
    (a, b) =>
      Math.floor(new Date(b.data.updatedDate ?? b.data.pubDate).getTime() / 1000) -
      Math.floor(new Date(a.data.updatedDate ?? a.data.pubDate).getTime() / 1000),
  );
};

export default getSortedPosts;
