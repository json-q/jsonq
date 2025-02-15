// https://liaoxuefeng.com/blogs/all/2024-01-05-js-full-text-search/index.html

const ALPHABETS = [
  [0x30, 0x39], // 0-9
  [0x41, 0x5a], // A-Z
  [0x61, 0x7a], // a-z
  [0xc0, 0x2af], // part of Latin-1 supplement / Latin extended A/B / IPA
  [0x370, 0x52f], // Greek / Cyrillic / Cyrillic supplement
];

const SINGLE_CHARS = [
  [0xe00, 0x0e5b], // Thai
  [0x3040, 0x309f], // Hiragana
  [0x4e00, 0x9fff], // CJK
  [0xac00, 0xd7af], // Hangul syllables
];

function isAlphabet(n: number) {
  for (const range of ALPHABETS) {
    if (n >= range[0] && n <= range[1]) {
      return true;
    }
  }
  return false;
}

function isSingleChar(n: number) {
  for (const range of SINGLE_CHARS) {
    if (n >= range[0] && n <= range[1]) {
      return true;
    }
  }
  return false;
}

export function tokenizer(str: string) {
  const length = str.length;
  const tokens = [];
  let last = '';
  for (let i = 0; i < length; i++) {
    const code = str.charCodeAt(i);
    if (isSingleChar(code)) {
      if (last) {
        if (last.length > 1) {
          tokens.push(last.toLowerCase());
        }
        last = '';
      }
      tokens.push(str[i]);
    } else if (isAlphabet(code)) {
      last = last + str[i];
    } else {
      if (last) {
        if (last.length > 1) {
          tokens.push(last.toLowerCase());
        }
        last = '';
      }
    }
  }
  if (last) {
    if (last.length > 1) {
      tokens.push(last.toLowerCase());
    }
    last = '';
  }
  //console.log(str, tokens);
  return tokens;
}
