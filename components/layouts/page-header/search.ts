import { Document } from 'flexsearch';
import FlexSearchDocument from 'flexsearch/dist/module/document';
// import { tokenizer } from '~/utils/mixTokenizer';
// import { getPostList } from '~/utils/postData';
// import { fromMarkdown } from 'mdast-util-from-markdown';
// import { nanoid } from 'nanoid';

// const tags = ['Tabs', 'Video', 'ImageWrap', 'ImageLayout', 'Row', 'Col'];
// const tagStr = tags.join('|');
// const reg_replace = new RegExp(`<(${tagStr})s+[^>]*>|</(${tagStr})s*>`, 'g');

// type AstRoot = ReturnType<typeof fromMarkdown>;
export interface IndexItem {
  id: string;
  link: string;
  type: 'heading' | 'content';
  headings: string;
  content: string;
}

const index: Document<IndexItem, true> = new FlexSearchDocument({
  // encode: tokenizer,
  tokenize: 'full',
  cache: true,
  document: {
    id: 'id',
    index: 'content',
    store: true,
  },
  context: {
    resolution: 9,
    depth: 3,
    bidirectional: true,
  },
});
// const allPost = await getPostList();
// praseAst();

export default function searchDoc(query?: string) {
  if (!query) return [];
  const searchResult = index.search<true>(query, 10, { enrich: true });
  return searchResult;
}

// function getText(item: AstRoot['children'][number]) {
//   if ('children' in item) {
//     return item.children.reduce((total, item) => {
//       if ('children' in item) {
//         total += getText(item);
//       } else {
//         if ('value' in item) {
//           total += item.value;
//         }
//       }

//       return total;
//     }, '');
//   } else {
//     if ('value' in item) {
//       return item.value;
//     }
//   }

//   return '';
// }

// function praseAst() {
//   allPost.forEach((post) => {
//     const ast = fromMarkdown(post.content);
//     const items = ast.children;

//     const headings = [] as Array<{ title: string; level: number }>;

//     items.forEach((item) => {
//       const prev_heading = headings.at(-1);

//       let targetItem: IndexItem | null = null;
//       const id = nanoid(6);

//       if (item.type === 'heading') {
//         if (prev_heading) {
//           if (prev_heading.level < item.depth) {
//             headings.push({ title: getText(item), level: item.depth });
//           } else if (prev_heading.level === item.depth) {
//             headings.pop();

//             headings.push({ title: getText(item), level: item.depth });
//           } else if (prev_heading.level > item.depth) {
//             while (headings.at(-1)!.level > item.depth) {
//               headings.pop();
//             }

//             if (headings.at(-1)!.level === item.depth) {
//               headings.pop();

//               headings.push({ title: getText(item), level: item.depth });
//             } else {
//               headings.push({ title: getText(item), level: item.depth });
//             }
//           }
//         } else {
//           headings.push({ title: getText(item), level: item.depth });
//         }

//         targetItem = {
//           id,
//           link: post.url,
//           type: 'heading',
//           headings: headings.map((item) => item.title).join('>'),
//           content: getText(item),
//         };
//       } else {
//         let content: string = getText(item);

//         content = content./* replaceAll(reg_replace, ''). */ replaceAll('\n', '');

//         if (content) {
//           targetItem = {
//             id,
//             link: post.url,
//             type: 'content',
//             headings: headings.map((item) => item.title).join('>'),
//             content,
//           };
//         }
//       }

//       if (targetItem) index.add(targetItem);
//     });
//   });
// }
