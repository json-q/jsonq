'use client';
import Link from 'next/link';
import { addBasePath } from 'next/dist/client/add-base-path';
import { useDeferredValue, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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

export async function importPagefind() {
  window.pagefind = await import(/* webpackIgnore: true */ addBasePath('/_pagefind/pagefind.js'));
  await window.pagefind!.options({
    baseUrl: '/',
    // ... more search options
  });
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
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
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
      const r = data.map((newData) => ({
        ...newData,
        sub_results: newData.sub_results.map((r) => {
          const url = r.url.replace(/\.html$/, '').replace(/\.html#/, '#');

          return { ...r, url };
        }),
      }));

      setResults(r);
    };
    handleSearch(deferredSearch);
  }, [deferredSearch]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const EmptyStatus = ({ tip }: { tip: string }) => {
    return (
      <div className="h-[300px]">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <Search className="h-16 w-16 shrink-0 opacity-50" />
          <div className="text-foreground/60">{tip}</div>
        </div>
      </div>
    );
  };

  return (
    <Dialog /* onOpenChange={setOpen} */>
      <DialogTrigger asChild>
        <div className="hidden md:block">
          <Button
            variant="outline"
            className="bg-muted/50 text-muted-foreground relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-32 lg:w-48 xl:w-56"
          >
            <span className="inline-flex">Try Search</span>
            <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent hideCloseIcon className="gap-0 p-0">
        {/* Header 仅仅防止报错 */}
        <DialogHeader>
          <DialogTitle className="m-0 p-0"></DialogTitle>
          <DialogDescription className="m-0 p-0"></DialogDescription>
        </DialogHeader>

        <div className="flex items-center border-b px-3">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            className="border-none focus-visible:ring-0"
            placeholder="搜索文章"
            onChange={onSearch}
          />
        </div>
        {error ? (
          <EmptyStatus tip={error} />
        ) : loading ? (
          <EmptyStatus tip="搜索中..." />
        ) : results.length == 0 ? (
          <EmptyStatus tip="输入关键词搜索" />
        ) : (
          <ScrollArea className="text-foreground max-h-[300px] overflow-x-hidden overflow-y-auto px-2 py-1 md:max-h-[calc(100vh-300px)]">
            {results.map((item) => (
              <ResultList key={item.url} data={item} />
            ))}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultList({ data }: { data: PagefindResult }) {
  return data.sub_results.map((item) => {
    return (
      <Link
        key={item.url}
        href={item.url}
        className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-4 py-3 text-sm text-inherit outline-none select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <div>
          <div className="line-clamp-2 w-full" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
          <div className="overflow-hidden text-xs font-bold">{item.title}</div>
        </div>
      </Link>
    );
  });
}
