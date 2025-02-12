const { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } = require('fs');
const { join, basename, extname } = require('path');
const readingTime = require('reading-time');
const dayjs = require('dayjs');

/**
 * @typedef {Object} Metadata - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {string} date - 发布日期。
 */

/**
 * @typedef {Object} Toc - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {number} level - 标题深度
 * @property {string} id - 标题的 id，和 html 的 id 对应
 * @property {Array<Toc>} children - 嵌套标题数据
 */

/**
 *
 * @param {string} markdown md 元数据
 * @returns {Toc}
 */
function extractToc(markdown) {
  // 定义匹配Markdown标题的正则表达式
  const headingRegex = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/gm;

  let match;
  const toc = [];
  let lastLevel = 0;
  let stack = [{ children: toc }]; // 初始化栈，根节点有一个空的children数组

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // 标题级别，由#的数量决定
    const title = match[2].trim(); // 标题文本
    // id 就是把标题的空格转换成了 -
    const id = title.toLowerCase().replace(/\s+/g, '-');

    const item = { title: title, level: level, id: id, children: [] };

    if (level > lastLevel) {
      // 如果当前级别比上一级别深，则进入更深的一层
      stack[stack.length - 1].children.push(item);
      stack.push(item); // 更新栈顶为新添加的项
    } else if (level < lastLevel) {
      // 如果当前级别比上一级别浅，则返回到较浅的层次
      for (let i = 0; i < lastLevel - level; i++) {
        stack.pop(); // 弹出栈顶元素，回到上一层级
      }
      stack[stack.length - 1].children.push(item);
      stack.push(item); // 更新栈顶为新添加的项
    } else {
      // 如果当前级别与上一级别相同，则在同一层级添加
      stack.pop(); // 移除旧的同级项
      stack[stack.length - 1].children.push(item);
      stack.push(item); // 更新栈顶为新添加的项
    }

    lastLevel = level;
  }

  return toc;
}

/**
 * 解析 MDX 文件中的 Frontmatter 部分。
 * @param {string} fileContent
 * @returns {{frontMatter: Metadata, content: string, toc: Toc}}
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
  const toc = extractToc(content);

  return { frontMatter: metadata, content, toc };
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
 * @returns {{frontMatter: Metadata, content: string, toc: Toc}} 包含解析出的元数据和正文内容的对象。
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
          const { frontMatter, content, toc } = readMDXFile(file);
          const slug = basename(file, extname(file));
          return {
            ...frontMatter,
            url: `/blog/${slug}`,
            slug,
            publishedAt: dayjs(frontMatter.date).format('YYYY-MM-DD'),
            readingTime: readingTime(content).text,
            wordCount: content.split(/\s+/gu).length,
            content,
            toc,
          };
        })
        .sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }),
    ),
    'utf-8',
  );
  console.log('successfully generated!');
}
/**
 * @param {string} dir
 */
function createPostCategory(dir) {
  const files = readdirSync(dir);

  const directories = files
    .map((file) => {
      const fullPath = join(dir, file);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        return file;
      }
    })
    .filter((dir) => Boolean(dir)); // 过滤掉非目录项

  mkdirSync('generated', { recursive: true });

  writeFileSync(join(__dirname, '../generated/category.json'), JSON.stringify(directories));
}

createMDXData(join(__dirname, '../posts'));

createPostCategory(join(__dirname, '../posts'));
