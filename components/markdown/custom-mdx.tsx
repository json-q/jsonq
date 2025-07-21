import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";

import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";

import CustomMDXComponents from ".";

export default function CustomMDX(props: React.JSX.IntrinsicAttributes & MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...CustomMDXComponents, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: {
                  dark: "one-dark-pro",
                  light: "one-light",
                },
              },
            ],
            rehypeSlug,
          ],
        },
      }}
    />
  );
}
