

const { chromium } = require('playwright');
const fs = require('node:fs');

// 检查认证文件是否存在
if (!fs.existsSync('auth.json')) {
  console.error("错误：找不到 auth.json 文件。");
  console.error("请先运行 node setupAuth.js 来生成认证文件。");
  process.exit(1);
}

(async () => {
  // 启动无头浏览器并加载登录状态
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();

  try {
    console.log("1. 导航到掘金首页...");
    await page.goto("https://juejin.cn/user/center/signin", { timeout: 60000 });
    await page.waitForTimeout(3000); // 等待页面加载一些动态内容

    // --- 步骤 2: 执行签到 ---
    console.log("\n2. 尝试进行签到...");
    try {
      // 先检查页面是否正确加载
      console.log("  - 当前页面URL:", page.url());

      // 等待页面完全加载
      await page.waitForLoadState('networkidle');

      // 尝试等待签到相关元素出现
      try {
        await page.waitForSelector('text=签到', { timeout: 10000 });
        console.log("  - 找到签到相关文字");
      } catch (e) {
        console.log("  - 10秒内未找到签到相关文字，可能已经签到过了: ", e);
      }

      // 打印页面标题和部分内容
      console.log("  - 页面标题:", await page.title());
      const bodyText = await page.locator('body').textContent();
      console.log("  - 页面是否包含'掘金':", bodyText.includes('掘金'));
      console.log("  - 页面是否包含'签到':", bodyText.includes('签到'));

      // 页面已加载，重新检查签到按钮
      const signInSelectors = [
        'button:has-text("立即签到")',
      ];

      for (const selector of signInSelectors) {
        const element = page.locator(selector);
        const count = await element.count();
        const isVisible = count > 0 ? await element.isVisible() : false;
        console.log(`  - 选择器 "${selector}": 数量=${count}, 可见=${isVisible}`);

        if (count > 0) {
          const text = await element.textContent();
          console.log(`    文本内容: "${text}"`);
        }
      }

      // 尝试点击找到的签到按钮
      const checkInButton = page.locator('button:has-text("签到")');
      if (await checkInButton.count() > 0) {
        await checkInButton.click();
        console.log("  - 已点击签到按钮");
      } else {
        console.log("  - 未找到可点击的签到按钮");
      }
    } catch (e) {
      if (e.name === 'TimeoutError') {
        console.log("  - 等待签到成功弹窗超时，可能已经签到过了或UI已更改。");
      } else {
        console.log(`  - 签到过程中出现错误: ${e.message}`);
      }
    }

    // --- 步骤 3: 执行抽奖 ---
    console.log("\n3. 尝试进行抽奖...");
    try {
      console.log("  - 导航到抽奖页面...");
      await page.goto("https://juejin.cn/user/center/lottery", { timeout: 60000 });
      await page.waitForTimeout(3000);

      // 找到“免费抽奖”按钮并点击
      const drawButton = page.locator('#turntable-item-0');
      if (await drawButton.isVisible()) {
        await drawButton.click();
        console.log("  - 点击了抽奖按钮。");
        // 等待抽奖结果弹窗
        await page.waitForSelector('.lottery-modal .byte-modal__body', { timeout: 10000 });
        const resultText = await page.locator('.lottery-modal .byte-modal__body').textContent();
        console.log(`  - 抽奖完成！获得: ${resultText.trim()}`);
      } else {
        console.log("  - 未找到抽奖按钮，可能没有抽奖次数或UI已更改。");
      }
    } catch (e) {
      if (e.name === 'TimeoutError') {
        console.log("  - 等待抽奖结果超时或未找到抽奖按钮。");
      } else {
        console.log(`  - 抽奖过程中出现错误: ${e.message}`);
      }
    }

  } finally {
    console.log("\n任务执行完毕，关闭浏览器。");
    await browser.close();
  }
})();
