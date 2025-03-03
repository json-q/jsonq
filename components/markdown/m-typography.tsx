import { cn } from '~/lib/utils';

export function MH1(props: React.JSX.IntrinsicElements['h1']) {
  const { className, ...restProps } = props;
  return (
    <h1
      {...restProps}
      className={cn(
        className,
        'md-header scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      )}
    ></h1>
  );
}

export function MH2(props: React.JSX.IntrinsicElements['h2']) {
  const { className, ...restProps } = props;
  return (
    <h2
      {...restProps}
      className={cn(
        className,
        'md-header scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      )}
    ></h2>
  );
}

export function MH3(props: React.JSX.IntrinsicElements['h3']) {
  const { className, ...restProps } = props;
  return (
    <h3
      {...restProps}
      className={cn(className, 'md-header scroll-m-20 text-2xl font-semibold tracking-tight')}
    />
  );
}

export function MH4(props: React.JSX.IntrinsicElements['h4']) {
  const { className, ...restProps } = props;
  return (
    <h4
      {...restProps}
      className={cn(className, 'md-header scroll-m-20 text-xl font-semibold tracking-tight')}
    />
  );
}

export function MP(props: React.JSX.IntrinsicElements['p']) {
  const { className, ...restProps } = props;
  return <p {...restProps} className={cn(className, 'leading-7 [&:not(:first-child)]:mt-6')} />;
}

export function MUl(props: React.JSX.IntrinsicElements['ul']) {
  const { className, ...restProps } = props;
  return <ul {...restProps} className={cn(className, 'ml-4 list-disc [&>li]:mt-2')} />;
}

export function MBlockquote(props: React.JSX.IntrinsicElements['blockquote']) {
  const { className, ...restProps } = props;
  return <blockquote {...restProps} className={cn(className, 'mt-6 border-l-2 pl-6 italic')} />;
}

export function MTr(props: React.JSX.IntrinsicElements['tr']) {
  const { className, ...restProps } = props;
  return <tr {...restProps} className={cn(className, 'even:bg-muted m-0 border-t p-0')} />;
}
export function MTd(props: React.JSX.IntrinsicElements['td']) {
  const { className, ...restProps } = props;
  return (
    <td
      {...restProps}
      className={cn(
        className,
        'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
      )}
    />
  );
}

export function MTh(props: React.JSX.IntrinsicElements['th']) {
  const { className, ...restProps } = props;
  return (
    <th
      {...restProps}
      className={cn(
        className,
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
      )}
    />
  );
}
