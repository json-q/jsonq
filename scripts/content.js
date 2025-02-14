const { mkdirSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { join, basename, extname } = require('path');
const readingTime = require('reading-time');
const dayjs = require('dayjs');

/**
 * @typedef {Object} Metadata - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {string} date - 文章发布时间。
 */

/**
 * @typedef {Object} Toc - 元数据对象。
 * @property {string} title - 文章标题。
 * @property {number} level - 标题深度
 * @property {string} id - 标题的 id，和 html 的 id 对应
 * @property {Array<Toc>} children - 嵌套标题数据
 */

/**
 * @typedef {Object} PostJsonData - 文章json数据
 * @property {string} title - 标题
 * @property {string} publishedAt - 发布时间，格式化
 * @property {string} url - 文章路由
 * @property {number} slug - 文章参数（文件名）
 * @property {string} readingTime - 阅读时长
 * @property {number} wordCount - 文章字数
 * @property {string} content - 文章md内容
 * @property {Toc} toc - 目录结构
 */

/**
 *
 * @param {string} markdown md 元数据
 * @returns {Toc}
 */
function extractToc(markdown) {
  // 定义匹配Markdown标题的正则表达式
  const headingRegex = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/gm;
  // 定义匹配代码块开始和结束的正则表达式
  const codeBlockStartRegex = /^```/;
  let inCodeBlock = false;

  let match;
  const toc = [];
  let lastLevel = 0;
  let stack = [{ children: toc }]; // 初始化栈，根节点有一个空的children数组

  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (codeBlockStartRegex.test(line)) {
      // 如果遇到代码块开始或结束的标记，则切换inCodeBlock标志位
      inCodeBlock = !inCodeBlock;
      continue; // 跳过代码块中的行
    }

    if (!inCodeBlock && (match = headingRegex.exec(line)) !== null) {
      headingRegex.lastIndex = 0; // 重置正则表达式的索引，以便下一次匹配能从头开始
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
            title: frontMatter.title,
            publishedAt: dayjs(frontMatter.date).format('YYYY-MM-DD HH:mm'),
            order: Number(frontMatter.order) || 0,
            url: `/blog/${slug}`,
            slug,
            readingTime: readingTime(content).text,
            wordCount: content.split(/\s+/gu).length,
            content,
            toc,
          };
        })
        .filter((item) => item.slug != 'README')
        .sort((a, b) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }),
    ),
    'utf-8',
  );
  console.log('successfully generated!');
}

createMDXData(join(__dirname, '../post'));
