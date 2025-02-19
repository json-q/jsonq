import React from 'react';
import type { Toc } from '~/scripts/content';

// 主组件接收TOC数据作为props，并渲染整个目录树
const TocTree = (props: { toc: Toc[] }) => {
  const { toc } = props;
  if (toc.length == 0) return null;
  const level = toc[0].level;

  return (
    <ul className="m-0 list-none p-0 text-sm" style={{ paddingLeft: `${(level - 1) * 0.5}rem` }}>
      {toc.map(
        (item) =>
          // only render h1, h2, h3
          item.level <= 4 && (
            <li key={item.id} className="mb-2 mt-0 p-0">
              <a
                className="block text-gray-700 no-underline hover:text-blue-600 dark:text-gray-200"
                href={`#${item.id}`}
              >
                {item.title}
              </a>
              {item.children && item.children.length > 0 && <TocTree toc={item.children} />}
            </li>
          ),
      )}
    </ul>
  );
};

export default TocTree;
