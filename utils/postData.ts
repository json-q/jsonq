import allPosts from '~/generated/content.json';
import { PostJsonData } from '~/scripts/content';

// only format type
const posts = allPosts as unknown as PostJsonData[];

export function getAllPost() {
  return posts;
}

export function getPostBySlug(slug: string) {
  const post = allPosts.find((post) => post.slug === slug);
  return post;
}
