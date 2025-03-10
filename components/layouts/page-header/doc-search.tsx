'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { File, Heading, Search } from 'lucide-react';
import { EnrichedDocumentSearchResultSetUnitResultUnit } from 'flexsearch';
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
import searchDoc, { IndexItem } from './search';

export default function DocSearch() {
  const [open, setOpen] = useState(false);
  const [searchList, setSearchList] = useState<
    EnrichedDocumentSearchResultSetUnitResultUnit<IndexItem>[]
  >([]);

  useEffect(() => {
    if (!open) setSearchList([]);
  }, [open]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = searchDoc(e.target.value);

    setSearchList(result.length > 0 ? result[0].result : []);
  };

  const Line = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return (
      <Link
        href={href}
        className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-4 py-3 text-sm text-inherit outline-none select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        {children}
      </Link>
    );
  };

  return (
    <Dialog onOpenChange={setOpen}>
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
            onChange={debounce(onSearch, 200)}
          />
        </div>
        {searchList.length == 0 && (
          <div className="h-[300px]">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <Search className="h-16 w-16 shrink-0 opacity-50" />
              <div className="text-foreground/60">输入关键词搜索</div>
            </div>
          </div>
        )}
        {searchList.length > 0 && (
          <ScrollArea className="text-foreground max-h-[300px] overflow-x-hidden overflow-y-auto px-2 py-1 md:max-h-[calc(100vh-300px)]">
            {searchList.map((item) => {
              if (item.doc.type == 'heading') {
                return (
                  <Line key={item.doc.id} href={item.doc.link}>
                    <Heading /> {item.doc.headings}
                  </Line>
                );
              }
              return (
                <Line key={item.doc.id} href={item.doc.link}>
                  <File />
                  <div>
                    <div className="line-clamp-2 w-full">{item.doc.content}</div>
                    <div className="text-muted-foreground overflow-hidden text-xs font-bold">
                      {item.doc.headings}
                    </div>
                  </div>
                </Line>
              );
            })}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
