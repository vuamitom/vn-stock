import puppeteer from "puppeteer";
import dotenv from "dotenv";
import slugify from "slugify";
import fs from "fs/promises";

dotenv.config();
const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const login = async (page, email, password) => {
  console.info("loggin in as ", email);
  page.goto("https://finance.vietstock.vn/", { timeout: 60000 });
  const loginBtn = await page.waitForSelector("#btn-request-call-login");
  await new Promise((resolve) => setTimeout(resolve, 5000));

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
  console.info("fetching data for ", name);
  const url = `https://finance.vietstock.vn/${code}-${slugify(name)}.htm`;
  await page.goto(url, { timeout: 60000 });
  let nextBtn = await page.waitForSelector(`a[href="/${code}/tai-chinh.htm"]`);
  await nextBtn.evaluate((btn) => btn.click());
  nextBtn = await page.waitForSelector('a[href="?tab=CSTC"]');
  await nextBtn.evaluate((btn) => btn.click());
  const periodSelect = await page.waitForSelector('select[name="period"]');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  const waitResponse = page.waitForResponse((response) =>
    response.url().includes("/GetFinanceIndexDataValue_CSTC_ByListTerms")
  );
  await periodSelect.evaluate((select) => {
    select.value = "9";
    select.dispatchEvent(new Event("change"));
  });
  await waitResponse;
  await (
    await page.waitForSelector("#dropdownMenuButton")
  ).evaluate((btn) => btn.click());
  const copyBtn = await page.waitForSelector("::-p-text(Sao chép)");
  await copyBtn.evaluate((btn) => btn.click());

  // console.log(".>>> test ");
  // const clipboardData = await page.evaluate(() => {
  //   const test = navigator.clipboard.readText();
  //   console.log(test);
  //   return test;
  // });
  // console.log("Clipboard data:", clipboardData);
  // // Write clipboardData as a tab delimited CSV file
  // await fs.writeFile(`./data/${code}-CSTC.csv`, clipboardData);

  // console.log("CSV file created successfully");
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(
    process.env.UI
      ? { headless: false, executablePath: chromePath }
      : { headless: true }
  );
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://finance.vietstock.vn", [
    "clipboard-read",
  ]);
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setViewport({ width: 1280, height: 1024 });
  await login(page, process.env.EMAIL, process.env.PSSWD);
  await getCompanyFinanceData(page, "VNM", "Vinamilk");
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
