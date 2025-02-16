import { MDXRemoteProps } from 'next-mdx-remote/rsc';
import MLink from './m-link';
import MImage from './m-image';
import MPre from './m-pre';
import { MBlockquote, MH1, MH2, MH3, MH4, MP, MTd, MTh, MTr, MUl } from './m-typography';

const CustomMDXComponents: MDXRemoteProps['components'] = {
  a: MLink,
  img: MImage,
  pre: MPre,
  h1: MH1,
  h2: MH2,
  h3: MH3,
  h4: MH4,
  p: MP,
  ul: MUl,
  blockquote: MBlockquote,
  tr: MTr,
  td: MTd,
  th: MTh,
};

export default CustomMDXComponents;
