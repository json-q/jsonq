const { mkdirSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { join, basename, extname } = require('path');
const readingTime = require('reading-time');
const dayjs = require('dayjs');

/**
 * @typedef {Object} Metadata - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {string} date - 发布日期。
 */

/**
 * 解析 MDX 文件中的 Frontmatter 部分。
 * @param {string} fileContent
 * @returns {{frontMatter: Metadata, content: string}}
 */
function parseFrontmatter(fileContent) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  /** @type {Metadata} */
  const metadata = {};
  if (match) {
    const frontMatterBlock = match[1];
    const frontMatterLines = frontMatterBlock.trim().split('\n');

    frontMatterLines.forEach((line) => {
      const [key, ...valueArr] = line.split(': ');
      let value = valueArr.join(': ').trim();
      value = value.replace(/^['"](.*)['"]$/, '$1');
      metadata[key.trim()] = value;
    });
  }

  const content = fileContent.replace(frontmatterRegex, '').trim();

  return { frontMatter: metadata, content };
}

/**
 * 获取指定目录下的所有MD/MDX文件。
 * @param {string} dir
 * @returns {Array<string>}
 */
function getMDXFiles(dir) {
  const files = [];

  // 递归获取目录下的所有 md/mdx 文件
  function recurse(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        recurse(fullPath);
      } else if (['.md', '.mdx'].find((item) => extname(entry.name) == item)) {
        files.push(fullPath);
      }
    });
  }
  // return readdirSync(dir).filter((file) => extname(file) === '.mdx' || extname(file) === '.md');
  recurse(dir);
  return files;
}

/**
 * 读取并解析一个MDX文件的内容。
 * @param {string} filePath - 文件的完整路径。
 * @returns {{frontMatter: Metadata, content: string}} 包含解析出的元数据和正文内容的对象。
 */
function readMDXFile(filePath) {
  const rawContent = readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

/**
 * @param {string} dir
 */
function getMDXData(dir) {
  const mdxFiles = getMDXFiles(dir);
  try {
    mkdirSync('generated', { recursive: true });
  } catch (e) {
    console.log('Cannot create folder ', e);
  }
  writeFileSync(
    join(process.cwd(), 'generated/content.json'),
    JSON.stringify(
      mdxFiles
        .map((file) => {
          const { frontMatter, content } = readMDXFile(file);
          const slug = basename(file, extname(file));
          return {
            ...frontMatter,
            url: `/blog/${slug}`,
            slug,
            publishedAt: dayjs(frontMatter.date).format('YYYY-MM-DD'),
            readingTime: readingTime(content).text,
            wordCount: content.split(/\s+/gu).length,
            content,
          };
        })
        .sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }),
    ),
  );
  console.log('successfully generated!');
}

getMDXData(join(process.cwd(), 'posts'));
