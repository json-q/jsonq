import { getAllPost } from '~/utils/postData';

export default function PostList() {
  const allPosts = getAllPost();

  return (
    <>
      {allPosts.map((post) => (
        <p key={post.slug}>{post.readingTime}</p>
      ))}
    </>
  );
}
