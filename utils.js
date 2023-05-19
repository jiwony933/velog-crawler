const TurndownService = require('turndown');

// HTML을 마크다운으로 변환하는 함수
function convertToMarkdown(html) {
  const turndownService = new TurndownService();
  turndownService.addRule('pre', {
    filter: 'pre',
    replacement: function (content, node) {
      const language = node.firstChild && node.firstChild.className;
      const codeBlock =
        '\n```' + (language?.split('-')[1] || '') + '\n' + content + '\n```';
      return codeBlock;
    },
  });

  return turndownService.turndown(html);
}

function removeSpecialCharacters(filename) {
  const specialCharactersRegex = /[^a-zA-Z0-9가-힣\s-]|^(?=\s)|(?<=\s)$/g; // 특수문자 및 앞뒤 공백을 찾기 위한 정규식

  const parts = filename.split('.');
  const filenameWithoutExtension = parts[0];

  const cleanedFilename = filenameWithoutExtension
    .replace(specialCharactersRegex, (match, index) => {
      if (index === 0) {
        return ''; // 제목의 처음에 있는 특수 문자를 원하는 문자로 대체 (예: 빈 문자열)
      }
      return '-';
    })
    .trim()
    .replaceAll(' ', '-'); // 공백 제거는 trim() 함수로 처리

  return cleanedFilename;
}

function formatDateAgo(dateString) {
  if (dateString.includes('전')) {
    const currentDate = new Date();
    const daysAgo = dateString.split('일')[0];
    const daysToSubtract = parseInt(daysAgo, 10);
    currentDate.setDate(currentDate.getDate() - daysToSubtract);

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const parts = dateString.split(' ');
  const year = parts[0].replace('년', '');
  const month = parts[1].replace('월', '').padStart(2, '0');
  const day = parts[2].replace('일', '').padStart(2, '0');

  return `${year}-${month}-${day}`;
}

module.exports = {
  convertToMarkdown,
  removeSpecialCharacters,
  formatDateAgo,
};
