import type { PostJsonData } from "~/scripts/content";

type BaseList = Omit<PostJsonData, "content">;

export async function getPostList() {
  const postList = await import(`~/generated/catalog.json`);

  return postList.default as BaseList[];
}

export async function getPostBySlug(slug: string) {
  const post = await import(`~/generated/${slug}.json`);
  return post as PostJsonData;
}
