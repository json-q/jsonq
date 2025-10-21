import { createElement } from "react";
import { cn } from "@/lib/utils";
import AnchorIcon from "./icons/AnchorIcon";

type HeadingComponent = "h1" | "h2" | "h3" | "h4";

type HeadingProps<C extends HeadingComponent> = React.JSX.IntrinsicElements[C] & {
  component: C;
};

const BaseHeading = <C extends HeadingComponent>(props: HeadingProps<C>) => {
  const { component, className, id, children, ...restProps } = props;

  //  add anchor base icon
  return createElement(
    component,
    {
      ...restProps,
      id,
      className: cn("group flex  gap-1.5", className),
    },
    <>
      {children}
      {/* fix icon not align center */}
      <a
        href={`#${id}`}
        aria-label="anchor"
        className="inline-flex cursor-pointer items-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <AnchorIcon width="1em" height="1em" aria-hidden focusable={false} />
      </a>
    </>,
  );
};

export function MH1(props: React.JSX.IntrinsicElements["h1"]) {
  const { className, ...restProps } = props;
  return (
    <BaseHeading
      component="h1"
      {...restProps}
      className={cn("scroll-m-20 font-extrabold text-4xl tracking-tight", className)}
    />
  );
}

export function MH2(props: React.JSX.IntrinsicElements["h2"]) {
  const { className, ...restProps } = props;

  return (
    <BaseHeading
      component="h2"
      {...restProps}
      className={cn("scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0", className)}
    />
  );
}

export function MH3(props: React.JSX.IntrinsicElements["h3"]) {
  const { className, ...restProps } = props;

  return (
    <BaseHeading
      component="h3"
      {...restProps}
      className={cn("scroll-m-20 font-semibold text-2xl tracking-tight", className)}
    />
  );
}

export function MH4(props: React.JSX.IntrinsicElements["h4"]) {
  const { className, ...restProps } = props;

  return (
    <BaseHeading
      component="h4"
      {...restProps}
      className={cn("scroll-m-20 font-semibold text-xl tracking-tight", className)}
    />
  );
}

export function MP(props: React.JSX.IntrinsicElements["p"]) {
  const { className, ...restProps } = props;
  return <p {...restProps} className={cn(className, "leading-6 [&:not(:first-child)]:mt-6")} />;
}

export function MUl(props: React.JSX.IntrinsicElements["ul"]) {
  const { className, ...restProps } = props;
  return <ul {...restProps} className={cn(className, "ml-4 list-disc [&>li]:mt-2")} />;
}

export function MBlockquote(props: React.JSX.IntrinsicElements["blockquote"]) {
  const { className, ...restProps } = props;
  return <blockquote {...restProps} className={cn(className, "mt-6 border-l-2 pl-6 italic")} />;
}

export function MTr(props: React.JSX.IntrinsicElements["tr"]) {
  const { className, ...restProps } = props;
  return <tr {...restProps} className={cn(className, "m-0 border-t p-0 even:bg-muted")} />;
}
export function MTd(props: React.JSX.IntrinsicElements["td"]) {
  const { className, ...restProps } = props;
  return (
    <td
      {...restProps}
      className={cn(className, "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right")}
    />
  );
}

export function MTh(props: React.JSX.IntrinsicElements["th"]) {
  const { className, ...restProps } = props;
  return (
    <th
      {...restProps}
      className={cn(
        className,
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      )}
    />
  );
}
