// 批量替换 markdown 文件中的图片链接，更快捷的图床迁移
const fs = require('fs-extra');
const path = require('path');
const glob = require('fast-glob');

const SCAN_PATH = '../post';
const FETCH_URL = 'http://localhost:8888/oss/url'; // next server

// const imageRegex = /!\[.*?\]\((.*?)\)/g;
// const imageRegex = /!\[.*?\]\(https:\/\/img2024\.cnblogs\.com\/(.*?)\)/g; // https://img2024.cnblogs.com
const imageRegex = /!\[.*?\]\(https:\/\/static\.jsonq\.top\/(.*?)\)/g; // https://static.jsonq.top
// const imageRegex = /!\[.*?\]\(https:\/\/cdn\.jsdelivr\.net\/(.*?)\)/g;

// 获取最新的图片链接
async function updateImageLink(imgUrl) {
  try {
    const response = await fetch(FETCH_URL + `?imgUrl=${imgUrl}`);
    const res = await response.json();

    if (res.code === 0) {
      const newImgUrl = res.data;
      console.log(`Updated ${imgUrl} to ${newImgUrl}`);
      return newImgUrl;
    } else {
      throw new Error('Failed to update the image link.');
    }
  } catch (error) {
    console.error(`Error updating ${imgUrl}:`, error.message);
    return null;
  }
}

async function processMdFile(filePath) {
  let fileContent = await fs.readFile(filePath, 'utf-8');
  let updated = false;

  // 查找所有图片链接
  let match;
  while ((match = imageRegex.exec(fileContent)) !== null) {
    // const oldImgUrl = `https://cdn.jsdelivr.net/${match[1]}`;
    // const oldImgUrl = `https://img2024.cnblogs.com/${match[1]}`;
    const oldImgUrl = `https://img.jsonq.top/${match[1]}`;
    // const oldImgUrl = match[1];
    const newImgUrl = await updateImageLink(oldImgUrl);

    if (newImgUrl) {
      fileContent = fileContent.replace(oldImgUrl, newImgUrl);
      updated = true;
    }
  }

  if (updated) {
    await fs.writeFile(filePath, fileContent, 'utf-8');
  }
}

// 递归处理文件夹中的所有.md文件
async function processDirectory(directoryPath) {
  const files = await glob(`${directoryPath}/**/*.md`, {
    ignore: ['**/node_modules/**'],
  });
  for (const file of files) {
    await processMdFile(file);
  }
}

// 处理文件或文件夹
async function processPath(pathToProcess) {
  const stats = await fs.stat(pathToProcess);

  if (stats.isDirectory()) {
    await processDirectory(pathToProcess);
  } else if (
    stats.isFile() &&
    (path.extname(pathToProcess) === '.md' || path.extname(pathToProcess) === '.mdx')
  ) {
    await processMdFile(pathToProcess);
  }
}

// 主函数
async function main() {
  await processPath(path.resolve(__dirname, SCAN_PATH));
}

main().catch((err) => {
  console.error('Run error: ', err);
});
// const response = await fetch('http://localhost:3000/api/upload?imgUrl=1');
// const res = await response.json();
// console.log(response.ok, res);
