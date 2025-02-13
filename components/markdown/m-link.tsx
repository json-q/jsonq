import Link from 'next/link';

const CustomLink = (props: React.JSX.IntrinsicElements['a']) => {
  const { href, ...restProps } = props;
  if (href!.startsWith('#')) return <a {...props} />;

  if (!href!.startsWith('/')) {
    props = {
      target: '_blank',
      rel: 'noopener noreferrer',
      ...props,
    };
  }

  return <Link href={href!} {...restProps} />;
};

export default CustomLink;
