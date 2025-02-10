import { MDXRemoteProps } from 'next-mdx-remote/rsc';
import MLink from './m-link';
import MImage from './m-image';
import MPre from './m-pre';

const CustomMDXComponents: MDXRemoteProps['components'] = {
  a: MLink,
  img: MImage,
  pre: MPre,
};

export default CustomMDXComponents;
