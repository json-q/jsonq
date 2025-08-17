"use client";
import { Copy, CopyCheck } from "lucide-react";
import { Children, type ReactElement, useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

type MPreProps = React.PropsWithChildren<React.JSX.IntrinsicElements["pre"]>;

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
    const getTextContent = (children: any) => {
      let textContent = "";
      Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
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
      console.error("Access to clipboard rejected!");
    }

    try {
      await navigator.clipboard.writeText(getTextContent(children));
      setCopied(true);
    } catch {
      console.error("Failed to copy!");
    }
  }, [children]);

  const IconToUse = isCopied ? CopyCheck : Copy;

  return (
    <>
      <pre {...restProps}>{children}</pre>
      <Button
        variant="secondary"
        size="icon"
        className="copy-btn absolute top-2 right-2 size-8 cursor-pointer border border-input transition-opacity"
        onClick={handleClick}
        tabIndex={0}
      >
        <IconToUse />
      </Button>
    </>
  );
};

export default MPre;
