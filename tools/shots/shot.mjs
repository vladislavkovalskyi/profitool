import puppeteer from "puppeteer-core";

// node shot.mjs <url> <width> <out.png> [height] [full]
const [url, width, out, height = "900", full = "1"] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: Number(height), deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
// прячем индикатор dev-сборки Next, он в кадре не нужен
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
// прокручиваем страницу, чтобы сработали ленивые картинки, и ждём их все
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
  const imgs = [...document.images];
  await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 15000); }))));
});
await new Promise((r) => setTimeout(r, 400));
const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
if (broken.length) console.log("BROKEN IMAGES:", broken);
const overflow = await page.evaluate(() => ({
  viewport: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
await page.screenshot({ path: out, fullPage: full === "1" });
console.log(JSON.stringify({ out, ...overflow, overflowX: overflow.scrollWidth > overflow.viewport }));
await browser.close();

