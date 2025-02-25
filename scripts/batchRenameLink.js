// 批量替换 markdown 文件中的图片链接，更快捷的图床迁移
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { join, extname } = require('path');

const SCAN_PATH = '../post';
const FETCH_URL = 'http://localhost:3000/api/upload'; // next server

const imageRegex = /!\[.*?\]\(https:\/\/img\.example\.com\/(.*?)\)/g; // https://img.example.com
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
  let fileContent = readFileSync(filePath, 'utf-8');
  let updated = false;

  // 查找所有图片链接
  let match;
  while ((match = imageRegex.exec(fileContent)) !== null) {
    // const oldImgUrl = `https://cdn.jsdelivr.net/${match[1]}`;
    // const oldImgUrl = `https://img2024.cnblogs.com/${match[1]}`;
    const oldImgUrl = `https://img.example.com/${match[1]}`;
    const newImgUrl = await updateImageLink(oldImgUrl);

    if (newImgUrl) {
      fileContent = fileContent.replace(oldImgUrl, newImgUrl);
      updated = true;
    }
  }

  if (updated) {
    writeFileSync(filePath, fileContent, 'utf-8');
  }
}

// 递归处理文件夹中的所有.md文件
async function processDirectory(dir) {
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
  for (const file of files) {
    await processMdFile(file);
  }
}

async function main() {
  await processDirectory(join(__dirname, SCAN_PATH));
}

main().catch((err) => {
  console.error('Run error: ', err);
});
