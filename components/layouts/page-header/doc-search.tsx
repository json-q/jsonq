'use client';
import Link from 'next/link';
import { useState } from 'react';
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
import searchDoc, { IndexItem } from './search';

export default function CommandMenu() {
  const [searchList, setSearchList] = useState<
    EnrichedDocumentSearchResultSetUnitResultUnit<IndexItem>[]
  >([]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = searchDoc(e.target.value);

    setSearchList(result.length > 0 ? result[0].result : []);
  };

  const Line = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return (
      <Link
        href={href}
        className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-4 py-3 text-sm text-inherit outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        {children}
      </Link>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="hidden md:block">
          <Button
            variant="outline"
            className="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-32 lg:w-48 xl:w-56"
          >
            <span className="inline-flex">Try Search</span>
            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
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
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
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
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden px-2 py-1 text-foreground md:max-h-[calc(100vh-300px)]">
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
                    <div className="overflow-hidden text-xs font-bold text-muted-foreground">
                      {item.doc.headings}
                    </div>
                  </div>
                </Line>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
