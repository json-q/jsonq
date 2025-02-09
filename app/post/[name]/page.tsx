import { compileMDX, CompileMDXResult } from 'next-mdx-remote/rsc';
import { readFile } from 'node:fs/promises';
import path from 'path';
import type { Metadata } from 'next';
import ErrorResult from '~/components/layouts/error-result';

async function getMDXContent(name: string): Promise<CompileMDXResult<Metadata> | null> {
  try {
    const filePath = path.join(process.cwd(), '/posts/', `${name}.md`);
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return await compileMDX({ source: contents, options: { parseFrontmatter: true } });
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;

  const res = await getMDXContent(name);
  if (!res) return { title: '' };
  const { frontmatter } = res;
  return { title: frontmatter.title };
}

export default async function Page({ params }: Props) {
  const { name } = await params;

  const res = await getMDXContent(name);

  if (!res) return <ErrorResult status="404" back="prev" />;

  return res.content;
}
