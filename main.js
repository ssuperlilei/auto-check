

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
      // 找到“去签到”按钮。我们用一个更可靠的组合选择器
      const checkInButton = page.locator('.signin.btn');
      console.log("  - 查找'去签到'按钮... ", checkInButton);
      if (await checkInButton.isVisible()) {
        const buttonText = await checkInButton.textContent();
        if (buttonText.includes('立即签到')) {
          await checkInButton.click();
          console.log("  - 点击了'去签到'按钮。");
          // 等待签到成功的弹窗出现
          await page.waitForSelector('text=签到成功', { timeout: 10000 });
          console.log("  - 签到成功！");
        } else {
          console.log(`  - 按钮文本为 "${buttonText}"，可能已经签到过了。`);
        }
      } else {
        console.log("  - 未找到'去签到'按钮，可能已经签到过了。");
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
