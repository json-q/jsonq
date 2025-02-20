const { mkdirSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { join, basename, extname } = require('path');
const readingTime = require('reading-time');

const POST_DIR = 'post';

/**
 * @typedef {Object} Metadata - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {string} date - 文章发布时间。
 */

/**
 * @typedef {Object} PostJsonData - 文章json数据
 * @property {string} title - 标题
 * @property {string} publishedAt - 发布时间，格式化
 * @property {string} url - 文章路由
 * @property {string} slug - 文章参数（文件名）
 * @property {string} readingTime - 阅读时长
 * @property {number} wordCount - 文章字数
 * @property {string} content - 文章md内容
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

  const normalContent = fileContent.replace(frontmatterRegex, '').trim();

  const innerLinkReg = new RegExp(`\\[([^\\]]+)\\]\\(/${POST_DIR}/([^)]+)\\)`, 'g');

  // 替换链接中的中间路径部分（md 中指向的是本地文件，存在嵌套文件夹，但是生成的 url 不包含嵌套，会 404）
  const content = normalContent.replace(innerLinkReg, (match, text, path) => {
    // 如果路径中的连接地址存在 .md 后缀，去掉
    const filename = path.split('/').pop().replace(/\.md$/, '');
    return `[${text}](/${POST_DIR}/${filename})`;
  });

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
  recurse(dir);
  return files;
  // return readdirSync(dir).filter((file) => extname(file) === '.mdx' || extname(file) === '.md');
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
function createMDXData(dir) {
  const mdxFiles = getMDXFiles(dir);

  mkdirSync('generated', { recursive: true });

  writeFileSync(
    join(__dirname, '../generated/content.json'),
    JSON.stringify(
      mdxFiles
        .map((file) => {
          const { frontMatter, content } = readMDXFile(file);
          const slug = basename(file, extname(file));
          return {
            title: frontMatter.title,
            publishedAt: frontMatter.date,
            url: `/${POST_DIR}/${slug}`,
            slug,
            readingTime: readingTime(content).text,
            wordCount: content.split(/\s+/gu).length,
            content,
          };
        })
        .filter((item) => item.slug != 'README')
        .sort((a, b) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }),
    ),
    'utf-8',
  );
  console.log('😊 successfully generated!');
}

createMDXData(join(__dirname, `../${POST_DIR}`));
