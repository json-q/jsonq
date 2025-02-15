import { Index } from 'flexsearch';
import { useMemo } from 'react';
import { tokenizer } from '~/utils/mixTokenizer';
import { getAllPost } from '~/utils/postData';

const index = new Index({
  encode: tokenizer,
});
const allPost = getAllPost();
const postMap = new Map(allPost.map((post) => [post.slug, post]));

allPost.forEach((post) => {
  index.add(post.slug, post.content);
});

export default function useSearch(query?: string) {
  return useMemo(() => {
    if (!query) return [];
    const urls = index.search(query);
    return urls.map((url) => {
      const post = postMap.get(url as string);
      return {
        url: url,
        keySentence: extractContextAroundKeyword(post?.content || '', query),
      };
    });
  }, [query]);
}

function extractContextAroundKeyword(content: string, keyword: string) {
  // 匹配整个句子，包括前后的换行符
  const regex = new RegExp(`(.*?\\n)?([^\\n]*${keyword}[^\\n]*)(\\n.*?)?`, 'i');
  const match = content.match(regex);

  if (match) {
    return match[2];
    // return {
    //   before: match[1] ? match[1].trim() : '', // 前面的句子
    //   match: match[2], // 匹配到的句子
    //   after: match[3] ? match[3].trim() : '', // 后面的句子
    // };
  }
  return null;
}
