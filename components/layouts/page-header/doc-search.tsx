'use client';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocSearchModal, useDocSearchKeyboardEvents } from '@docsearch/react';
import siteConfig from '~/config/siteConfig';
import { Button } from '~/components/ui/button';
import '@docsearch/css';

export default function AlgoliaDocSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    searchButtonRef,
  });

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-32 lg:w-48 xl:w-56"
      >
        <span className="inline-flex">Try Search</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      {isOpen &&
        createPortal(
          <DocSearchModal
            initialScrollY={window.scrollY}
            appId={siteConfig.docSearch.appId}
            apiKey={siteConfig.docSearch.apiKey}
            indexName={siteConfig.docSearch.indexName}
            onClose={onClose}
            placeholder="搜索文章内容"
            hitComponent={({ hit, children }) => <Link href={hit.url}>{children}</Link>}
          />,
          document.body,
        )}
    </>
  );
}
