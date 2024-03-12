import puppeteer from "puppeteer";
import dotenv from "dotenv";

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
  await login(page, process.env.EMAIL, process.env.PSSWD);
})();
