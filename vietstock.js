import puppeteer from "puppeteer";
const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const login = async (page) => {
  page.goto("https://finance.vietstock.vn/", { timeout: 60000 });
  const loginBtn = await page.waitForSelector("#btn-request-call-login");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await loginBtn.evaluate((btn) => btn.click());
  await page.waitForSelector("#content-login-form-input");
  await page.type(
    '#content-login-form-input input[name="Email"]',
    process.env.USER
  );
  await page.type("#txtPassword", process.env.PWD);

  const triggerLoginBtn = await page.waitForSelector("#btnLoginAccount");
  await triggerLoginBtn.evaluate((btn) => btn.click());
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(
    process.env.UI
      ? { headless: false, executablePath: chromePath }
      : { headless: true }
  );
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setViewport({ width: 1280, height: 1024 });
  await login(page);
})();
