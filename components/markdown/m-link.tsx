import Link from "next/link";

const MLink = (props: React.JSX.IntrinsicElements["a"]) => {
  const { href } = props;
  if (href?.startsWith("#")) return <a {...props} />;

  // 外部链接
  if (href?.startsWith("http")) {
    props = {
      target: "_blank",
      rel: "noopener noreferrer",
      ...props,
    };
  }

  const { href: link, ...restProps } = props;

  return <Link href={link!} {...restProps} />;
};

export default MLink;
