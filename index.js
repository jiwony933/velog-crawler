const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeBelogPosts(username) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 2000 });

  // 벨로그 메인 페이지로 이동
  await page.goto(`https://velog.io/@${username}`);

  // 무한 스크롤 제일 아래로 내려옴
  await scrollToBottom(page);

  const postLinks = await page.evaluate(() => {
    const selector =
      '#root > div:nth-child(2) > div:nth-child(3) > div:nth-child(4) > div:nth-child(3) > div:nth-child(1) > div > a:nth-child(1)';
    const links = Array.from(document.querySelectorAll(selector)).map((el) =>
      el.getAttribute('href')
    );
    return links;
  });

  let tabCount = 5;
  let tabs = new Array(tabCount);
  for (let i = 0; i < tabs.length; i++) {
    tabs[i] = [];
  }
  await Promise.all(
    postLinks.map(async (link, index) => {
      tabs[index % tabCount].push(link);
    })
  );

  await Promise.all(
    tabs.map(async (links) => {
      const postPage = await browser.newPage();
      for await (const link of links) {
        postPage.goto(`https://velog.io${link}`);
        const post = await scrapPost(postPage);
        console.log(post, 'post');
      }
    })
  );

  console.log('end');
}

// 사용자 이름을 전달하여 스크래핑 시작
scrapeBelogPosts('hbin12212');

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

async function scrapPost(page) {
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
    };
  } catch (e) {
    console.log('❌❌❌❌', page.url(), e);
  }
}

async function savePost(post) {}
