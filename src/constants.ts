import { Mail } from "@lucide/astro";
import type { Props } from "astro";
import CnBlogs from "@/assets/CnBlogs.svg";
import Github from "@/assets/Github.svg";
import { SITE } from "./config";

interface SocialType {
  name: string;
  href: string;
  linkTitle: string;
  icon: (props: Props) => Element;
}

export const SOCIALS: Readonly<SocialType>[] = [
  {
    name: "GitHub",
    href: "https://github.com/json-q/jsonq",
    linkTitle: `${SITE.title} on GitHub`,
    icon: Github,
  },
  {
    name: "CnBlogs",
    href: "https://www.cnblogs.com/jsonq",
    linkTitle: `${SITE.title} on cnblogs`,
    icon: CnBlogs,
  },
  {
    name: "Mail",
    href: "mailto:9967300508@163.com",
    linkTitle: `Send email`,
    icon: Mail,
  },
];

interface NavLinkType {
  href: string;
  text: string;
}

export const NAV_LINKS: Readonly<NavLinkType>[] = [
  { href: "/posts", text: "文章" },
  { href: "/tags", text: "标签" },
  { href: "/about", text: "关于" },
];
