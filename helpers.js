const fs = require('fs');
const {
  convertToMarkdown,
  removeSpecialCharacters,
  formatDateAgo,
} = require('./utils');

function createMarkdownFile(data) {
  const markdownContent = `---
  title: '${data.title}'
  date: '${formatDateAgo(data.createdAt)}'
  category: ''
  summary : '${data.summary}'
  ---
  
  ${convertToMarkdown(data.content)}`;

  fs.writeFile(
    `posts/${removeSpecialCharacters(data.title)}.md`,
    markdownContent,
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Markdown file created successfully');
      }
    }
  );
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 1000;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrapPost(page, summary) {
  try {
    await page.waitForNavigation();
    await page.waitForSelector('h1:nth-child(1)');
    await page.waitForSelector('div.information > span:nth-child(3)');
    await page.waitForSelector('div.atom-one');

    const postTitle = await page.evaluate(() => {
      const selector = 'h1:nth-child(1)';
      const title = document.querySelector(selector).innerText;
      return title;
    });

    const postCreatedAt = await page.evaluate(() => {
      const selector = 'div.information > span:nth-child(3)';
      const createdAt = document.querySelector(selector).innerText;
      return createdAt;
    });

    const postContent = await page.evaluate(() => {
      const selector = 'div.atom-one';
      const content = document.querySelector(selector).innerHTML;
      return content;
    });

    return {
      title: postTitle,
      createdAt: postCreatedAt,
      content: postContent,
      summary: summary,
    };
  } catch (e) {
    console.log('❌❌❌❌', page.url(), e);
  }
}

module.exports = {
  scrollToBottom,
  scrapPost,
  createMarkdownFile,
};
