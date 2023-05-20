const puppeteer = require('puppeteer');
const { scrollToBottom, scrapPost, createMarkdownFile } = require('./helpers');

async function scrapeVelogPosts(username) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 2000 });

  // 벨로그 메인 페이지로 이동
  await page.goto(`https://velog.io/@${username}`);

  // 무한 스크롤 제일 아래로 내려옴
  await scrollToBottom(page);

  const postsWithLinkAndSummaries = await page.evaluate(() => {
    const linkSelector =
      '#root > div:nth-child(2) > div:nth-child(3) > div:nth-child(4) > div:nth-child(3) > div:nth-child(1) > div > a:nth-child(1)';
    const links = Array.from(document.querySelectorAll(linkSelector)).map(
      (el) => el.getAttribute('href')
    );

    const summarySelector =
      '#root > div:nth-child(2) > div:nth-child(3) > div:nth-child(4) > div:nth-child(3) > div:nth-child(1) > div > p';
    const summaries = Array.from(
      document.querySelectorAll(summarySelector)
    ).map((el) => el.innerText);

    const postsWithLinkAndSummaries = links.map((link, index) => ({
      link: link,
      summary: summaries[index],
    }));

    return postsWithLinkAndSummaries;
  });

  let tabCount = 5;
  let tabs = new Array(tabCount);
  for (let i = 0; i < tabs.length; i++) {
    tabs[i] = [];
  }
  await Promise.all(
    postsWithLinkAndSummaries.map(async (postsData, index) => {
      tabs[index % tabCount].push(postsData);
    })
  );

  await Promise.all(
    tabs.map(async (linksAndSummaries) => {
      const postPage = await browser.newPage();
      for await (const linkAndSummary of linksAndSummaries) {
        postPage.goto(`https://velog.io${linkAndSummary.link}`);

        const post = await scrapPost(postPage, linkAndSummary);
        createMarkdownFile(post);
      }
    })
  );

  await browser.close();
  console.log('스크래핑 종료');
}

// 사용자 이름을 전달하여 스크래핑 시작
scrapeVelogPosts('jiwonyyy');
