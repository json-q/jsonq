'use client';
import { File, Search } from 'lucide-react';
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

export default function CommandMenu() {
  // const list = useSearch(searchQuery);
  // console.log(list);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
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
          <Input className="border-none focus-visible:ring-0" onChange={onSearch} />
        </div>
        <div className="overflow-hidden px-2 py-1 text-foreground">
          <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-4 py-3 outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
            <File />
            oooooo
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
