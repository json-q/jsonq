import allPosts from '~/generated/content.json';
import postCategorys from '~/generated/category.json';

export async function getAllPost() {
  return allPosts;
}

export function getPostBySlug(slug: string) {
  const post = allPosts.find((post) => post.slug === slug);
  return post;
}

export async function getPostCategorys() {
  return postCategorys;
}
