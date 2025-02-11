import { compileMDX, CompileMDXResult } from 'next-mdx-remote/rsc';
import { readFile } from 'node:fs/promises';
import path from 'path';
import type { Metadata } from 'next';
import ErrorResult from '~/components/layouts/error-result';

async function getMDXContent(slug: string): Promise<CompileMDXResult<Metadata> | null> {
  try {
    const filePath = path.join(process.cwd(), '/posts/', `${slug}.md`);
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return await compileMDX({ source: contents, options: { parseFrontmatter: true } });
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const res = await getMDXContent(slug);
  if (!res) return { title: '' };
  const { frontmatter } = res;
  return { title: frontmatter.title };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const res = await getMDXContent(slug);

  if (!res) return <ErrorResult status="404" back="prev" />;

  return res.content;
}

// import CustomMDXComponents from '~/components/markdown';

// export const dynamicParams = false;
