'use client';
import { ReactElement, useCallback, useEffect, useState, Children } from 'react';
import { Copy, CopyCheck } from 'lucide-react';
import { cn } from '~/lib/utils';

type MPreProps = React.PropsWithChildren<React.JSX.IntrinsicElements['pre']>;

const MPre = (props: MPreProps): ReactElement => {
  const { children, ...restProps } = props;
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timerId = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  const handleClick = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTextContent = (children: any) => {
      let textContent = '';
      Children.map(children, (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          textContent += child;
        }
        children = child?.props?.children;
        if (children) {
          textContent += getTextContent(children);
        }
      });
      return textContent;
    };

    if (!navigator?.clipboard) {
      console.error('Access to clipboard rejected!');
    }

    try {
      await navigator.clipboard.writeText(getTextContent(children));
      setCopied(true);
    } catch {
      console.error('Failed to copy!');
    }
  }, [children]);

  const IconToUse = isCopied ? CopyCheck : Copy;

  return (
    <>
      <pre {...restProps}>{children}</pre>
      <button onClick={handleClick} tabIndex={0} className="copy-btn">
        <IconToUse
          className={cn(
            'block size-8 rounded border !bg-slate-200 p-1 text-slate-400 dark:!bg-slate-600',
            {
              '!bg-blue-200 text-blue-400 dark:!bg-blue-600': isCopied,
            },
          )}
        />
      </button>
    </>
  );
};

export default MPre;
