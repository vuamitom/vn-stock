import puppeteer from "puppeteer";
import dotenv from "dotenv";
import slugify from "slugify";
import fs from "fs/promises";
import { getCompanies, doesFileExist } from "./utils.js";

dotenv.config();
const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const waitFor = async (milisec) => {
  return await new Promise((resolve) => setTimeout(resolve, milisec));
};

const login = async (page, email, password) => {
  console.info("loggin in as ", email);
  page.goto("https://finance.vietstock.vn/", { timeout: 60000 });
  const loginBtn = await page.waitForSelector("#btn-request-call-login");
  await waitFor(5000);
  await loginBtn.evaluate((btn) => btn.click());
  await page.waitForSelector("#content-login-form-input");
  await page.type('#content-login-form-input input[name="Email"]', email);
  await page.type("#txtPassword", password);

  const triggerLoginBtn = await page.waitForSelector("#btnLoginAccount");
  await triggerLoginBtn.evaluate((btn) => btn.click());
  await page.waitForSelector("#btnAccountInfo");
  console.info("logged in successfully");
};

const getCompanyFinanceData = async (page, code, name) => {
  const outputFile = `./data/${code}-CSTC.csv`;
  if (await doesFileExist(outputFile)) {
    console.log("Output file already exists");
    return;
  }
  console.info("fetching data for ", name);
  const url = `https://finance.vietstock.vn/${code}-${slugify(name)}.htm`;
  page.goto(url, { timeout: 60000 });
  let nextBtn = await page.waitForSelector(`a[href="/${code}/tai-chinh.htm"]`);

  await nextBtn.evaluate((btn) => btn.click());

  nextBtn = await page.waitForSelector('a[href="?tab=CSTC"]');
  await nextBtn.evaluate((btn) => btn.click());
  const periodSelect = await page.waitForSelector('select[name="period"]');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  const reqs = [
    "CSTC_GetListTerms",
    "GetListReportNorm_CSTC_ByStockCode",
    "GetFinanceIndexDataValue_CSTC_ByListTerms",
  ];
  const pendingRequests = reqs.map((req) => {
    return page.waitForResponse((response) => response.url().includes(req));
  });
  await periodSelect.evaluate((select) => {
    select.value = "9";
    const evt = new Event("change", { bubbles: true });
    evt.simulated = true;
    select.dispatchEvent(evt);
  });
  await Promise.all(pendingRequests);
  await waitFor(1200);
  await (
    await page.waitForSelector("#dropdownMenuButton")
  ).evaluate((btn) => btn.click());

  const copyBtn = await page.waitForSelector("::-p-text(Sao chép)");
  await copyBtn.evaluate((btn) => btn.click());
  const clipboardData = await page.evaluate(() => {
    const test = navigator.clipboard.readText();
    return test;
  });
  // // Write clipboardData as a tab delimited CSV file
  await fs.writeFile(outputFile, clipboardData);
  console.log("CSV file created successfully");
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(
    process.env.UI
      ? {
          headless: false,
          executablePath: chromePath,
          args: ["--disable-features=site-per-process"],
        }
      : { headless: true, args: ["--disable-features=site-per-process"] }
  );
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://finance.vietstock.vn", [
    "clipboard-read",
  ]);
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1280, height: 1024 });
  await login(page, process.env.EMAIL, process.env.PSSWD);
  const companies = await getCompanies();
  for (const company of companies) {
    await getCompanyFinanceData(page, company.code, company.name);
  }
  // await getCompanyFinanceData(page, "TCH", "Công ty Cổ phần Nhựa An Phát Xanh");

  // await page.close();
})();

// {
//   const targetPage = page;
//   await puppeteer.Locator.race([
//     targetPage.locator("select.p1-2"),
//     targetPage.locator(
//       '::-p-xpath(//*[@id=\\"finance-content\\"]/div/div/div[2]/div/div[2]/div[1]/div[1]/select[1])'
//     ),
//     targetPage.locator(":scope >>> select.p1-2"),
//   ])
//     .setTimeout(timeout)
//     .click({
//       offset: {
//         x: 39.5,
//         y: 12.8125,
//       },
//     });
// }

// {
//   const targetPage = page;
//   await puppeteer.Locator.race([
//     targetPage.locator("select.p1-2"),
//     targetPage.locator(
//       '::-p-xpath(//*[@id=\\"finance-content\\"]/div/div/div[2]/div/div[2]/div[1]/div[1]/select[1])'
//     ),
//     targetPage.locator(":scope >>> select.p1-2"),
//   ])
//     .setTimeout(timeout)
//     .fill("9");
// }
