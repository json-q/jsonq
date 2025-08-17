"use client";
import { throttle } from "lodash-es";
import { TableOfContents } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import useMutationObserver from "~/hooks/useMutationObserver";
import { cn } from "~/lib/utils";

interface List {
  title: string | null;
  id: string;
  depth: number;
}

export default function TocTree() {
  const [list, setList] = useState<List[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();
  // const nodes = useRef<NodeListOf<Element>>(null); // 记录所有 h1,h2,h3 标签
  const tocRef = useRef<HTMLUListElement>(null); // TOC 组件 DOM
  const containerRef = useRef<HTMLElement>(null);

  const highlight = useCallback((i: number) => {
    setActiveIndex(i);
    // 包括可滚动区域的 top 值
    const top = (tocRef.current?.children[i] as HTMLElement)?.offsetTop;
    if (top) {
      // 获取 TOC DOM 的高度
      const tocHeight = tocRef.current?.clientHeight ?? 0;
      // 使用 scrollTo 滚动到 TOC DOM 当前视图高度一半的位置
      tocRef.current?.scrollTo({ top: top - tocHeight / 2 });
    }
  }, []);

  const scrollHandler = useCallback(() => {
    if (!containerRef.current) return;

    const viewHeight = window.innerHeight;
    // nodes 和 list 其实是一一对应的，所以可以设置一个索引判断哪个目录高亮了
    const nodes = Array.from(containerRef.current.querySelectorAll("h2, h3, h4"));
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
  }, [highlight]);

  const throttledScrollHandler = useCallback(throttle(scrollHandler, 100), []);

  const handleToc = useCallback(() => {
    const nodes = Array.from(containerRef.current?.querySelectorAll("h1, h2, h3") || []);
    const newList = nodes.map((node) => ({
      title: node.textContent,
      id: node.id,
      depth: +node.tagName[1],
    }));

    setList(newList);
  }, []);

  useEffect(() => {
    const container = document.querySelector(".md-container");
    if (!container) return;

    containerRef.current = container as HTMLElement;

    throttledScrollHandler();
    handleToc();

    window.addEventListener("scroll", throttledScrollHandler);
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [handleToc, throttledScrollHandler]);

  useMutationObserver(containerRef.current, handleToc);

  const renderList = () => {
    return (
      <ul ref={tocRef} className="m-0 list-none p-0 text-sm">
        {list.map(({ title, id, depth }, i) => (
          <li key={id} title={title || ""} className="mt-0 mb-2 w-full p-0">
            <a
              href={`#${id}`}
              className={cn("line-clamp-1 w-full text-foreground no-underline hover:text-link", {
                "text-link": i === activeIndex,
              })}
              style={{ paddingLeft: `${depth * 0.6}rem` }}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Sheet>
      <SheetTrigger>
        <TableOfContents className="fixed right-6 bottom-12 z-10 h-10 w-10 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-foreground shadow-sm transition-colors hover:bg-accent" />
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
