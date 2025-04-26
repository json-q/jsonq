'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { throttle } from 'lodash-es';
import { cn } from '~/lib/utils';
import { useIsMobile } from '~/hooks/use-mobile';
import { CircleArrowLeft } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import useMutationObserver from '~/hooks/useMutationObserver';

interface List {
  title: string | null;
  id: string;
  depth: number;
}

interface TocTreeProps {
  className?: string;
}

export default function TocTree(props: TocTreeProps) {
  const { className } = props;
  const [list, setList] = useState<List[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();
  // const nodes = useRef<NodeListOf<Element>>(null); // 记录所有 h1,h2,h3 标签
  const tocRef = useRef<HTMLUListElement>(null); // TOC 组件 DOM
  const containerRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const scrollHandler = useCallback(() => {
    if (!containerRef.current) return;

    const viewHeight = window.innerHeight;
    // nodes 和 list 其实是一一对应的，所以可以设置一个索引判断哪个目录高亮了
    const nodes = Array.from(containerRef.current.querySelectorAll('h1, h2, h3'));
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const rect = node.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top < viewHeight) {
        highlight(i);
        break;
      }

      // 如果下滑的过程中刚好碰到一个标题（A），这时候上滑，那么高亮的应该是 A 之前的标题
      const nextRect = nodes[i + 1]?.getBoundingClientRect();
      if (rect.bottom < 0 && nextRect && nextRect.top > window.innerHeight) {
        highlight(i);
        break;
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledScrollHandler = useCallback(throttle(scrollHandler, 100), []);

  function highlight(i: number) {
    setActiveIndex(i);
    // 包括可滚动区域的 top 值
    const top = (tocRef.current?.children[i] as HTMLElement)?.offsetTop;
    if (top) {
      // 获取 TOC DOM 的高度
      const tocHeight = tocRef.current?.clientHeight ?? 0;
      // 使用 scrollTo 滚动到 TOC DOM 当前视图高度一半的位置
      tocRef.current?.scrollTo({ top: top - tocHeight / 2 });
    }
  }

  const handleToc = useCallback(() => {
    const nodes = Array.from(containerRef.current?.querySelectorAll('h1, h2, h3') || []);
    const newList = nodes.map((node) => ({
      title: node.textContent,
      id: node.id,
      depth: +node.tagName[1],
    }));

    setList(newList);
  }, []);

  useEffect(() => {
    const container = document.querySelector('.md-container');
    if (!container) return;

    containerRef.current = container as HTMLElement;

    throttledScrollHandler();
    handleToc();

    window.addEventListener('scroll', throttledScrollHandler);
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [handleToc, throttledScrollHandler]);

  useMutationObserver(containerRef.current, handleToc);

  const renderList = () => {
    return (
      <ul ref={tocRef} className="m-o list-none p-0 text-sm">
        {list.map(({ title, id, depth }, i) => (
          <li key={id} title={title || ''} className="mt-0 mb-2 w-full p-0">
            <a
              href={`#${id}`}
              className={cn(
                'text-foreground line-clamp-1 w-full no-underline hover:text-blue-400',
                {
                  'text-blue-400 dark:text-blue-500': i === activeIndex,
                },
              )}
              style={{ paddingLeft: `${depth * 0.6}rem` }}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger>
          <CircleArrowLeft className="fixed top-1/4 right-0 z-20 h-7 w-7 translate-y-1/4 text-blue-600" />
        </SheetTrigger>
        <SheetContent className="overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4">{renderList()}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn('w-full max-w-[25%]', className)}>
      {/* calc top offset: header: 3 container: pt-1 pb-1 rem*/}
      <nav className="sticky top-20 max-h-screen overflow-y-auto border-l border-l-zinc-200 px-4 dark:border-l-zinc-700">
        {renderList()}
      </nav>
    </div>
  );
}
