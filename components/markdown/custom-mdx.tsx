import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc';

import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import rehypePrism from 'rehype-prism-plus';

import CustomMDXComponents from '.';

export default function CustomMDX(props: React.JSX.IntrinsicAttributes & MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...CustomMDXComponents, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                // 'one-dark-pro' | 'one-light'
                theme: 'one-light',
              },
            ],
            rehypeSlug,
            rehypeCodeTitles,
            [
              rehypePrism,
              {
                showLineNumbers: true,
              },
            ],
            [
              rehypeAutolinkHeadings,
              {
                properties: {
                  className: ['anchor'],
                },
                behavior: 'prepend',
                headingProperties: {
                  className: ['md-header'],
                },
                content: fromHtmlIsomorphic(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
                  { fragment: true },
                ).children,
              },
            ],
          ],
        },
      }}
    />
  );
}
