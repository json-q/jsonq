'use client';
import Link from 'next/link';
import { addBasePath } from 'next/dist/client/add-base-path';
import { useDeferredValue, useEffect, useState } from 'react';
import { CircleX, LoaderCircle, Search } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useIsMobile } from '~/hooks/use-mobile';

export async function importPagefind() {
  window.pagefind = await import(/* webpackIgnore: true */ addBasePath('/_pagefind/pagefind.js'));
  await window.pagefind?.options({ baseUrl: '/' });
}

type PagefindResult = {
  excerpt: string;
  meta: {
    title: string;
  };
  raw_url: string;
  sub_results: {
    excerpt: string;
    title: string;
    url: string;
  }[];
  url: string;
};

export default function DocSearch() {
  const [open, setOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const isMobile = useIsMobile();

  useEffect(() => {
    handleSearch(deferredSearch);
  }, [deferredSearch]);

  useEffect(() => {
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = async (value: string) => {
    if (!value) {
      setResults([]);
      setError('');
      return;
    }

    setIsLoading(true);
    if (!window.pagefind) {
      try {
        await importPagefind();
      } catch (error) {
        setError((error as Error).message);
        setIsLoading(false);
        return;
      }
    }
    const response = await window.pagefind!.debouncedSearch<PagefindResult>(value, {});
    if (!response) return;

    const data = await Promise.all(response.results.map((o) => o.data()));
    setIsLoading(false);
    setError('');

    const _results = data.map((newData) => ({
      ...newData,
      sub_results: newData.sub_results.map((r) => {
        const url = r.url.replace(/\.html$/, '').replace(/\.html#/, '#');

        return { ...r, url };
      }),
    }));

    setResults(_results);
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const down = (e: KeyboardEvent) => {
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
      if (
        (e.target instanceof HTMLElement && e.target.isContentEditable) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      e.preventDefault();
      setOpen((open) => !open);
    }
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {isMobile === false && (
          <Button
            variant="outline"
            className="bg-muted/50 text-muted-foreground relative h-8 w-full cursor-pointer justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-32 lg:w-48 xl:w-56"
          >
            <Search className="h-16 w-16 shrink-0 opacity-50" />
            <span className="inline-flex">Search...</span>
            <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="gap-0 p-0" hideCloseIcon>
        {/* Header 仅仅防止报错 */}
        <DialogHeader>
          <DialogTitle className="sr-only" aria-describedby="search-mask-title" />
          <DialogDescription className="sr-only" aria-describedby="search-mask-description" />
        </DialogHeader>

        <div className="flex items-center border-b px-3">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            className="border-none focus-visible:ring-0"
            placeholder="搜索文章"
            value={search}
            onChange={onSearch}
          />
        </div>
        {error ? (
          <EmptyStatus tip={error} icon={<CircleX className="h-16 w-16 shrink-0 opacity-50" />} />
        ) : loading ? (
          <EmptyStatus
            tip="加载中..."
            icon={<LoaderCircle className="h-16 w-16 shrink-0 animate-spin opacity-50" />}
          />
        ) : results.length == 0 ? (
          <EmptyStatus tip="暂无结果" icon={<Search className="h-16 w-16 shrink-0 opacity-50" />} />
        ) : (
          <ScrollArea className="text-foreground min-h-[300px] overflow-x-hidden overflow-y-auto px-2 py-1 md:max-h-[calc(100vh-300px)]">
            <ul className="w-full">
              {results.map((item) => (
                <ResultList key={item.url} data={item} closeModal={closeModal} />
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultList({ data, closeModal }: { data: PagefindResult; closeModal: () => void }) {
  return data.sub_results.map((item) => {
    return (
      <li
        onClick={closeModal}
        key={item.url}
        className="cursor-pointer gap-2 border-b text-sm text-inherit select-none"
      >
        <Link
          onKeyDown={(e) => e.key === 'Enter' && closeModal()}
          href={item.url}
          className="hover:bg-accent hover:text-accent-foreground inline-flex w-full flex-col rounded-sm px-3 py-2"
        >
          <div className="line-clamp-2 w-full" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
          <div className="mt-1 overflow-hidden text-xs font-bold">{item.title}</div>
        </Link>
      </li>
    );
  });
}

function EmptyStatus({ tip, icon }: { tip: string; icon: React.ReactNode }) {
  return (
    <div className="h-[300px]">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {icon}
        <div className="text-foreground/60">{tip}</div>
      </div>
    </div>
  );
}
