# 掘金自动签到抽奖脚本

这是一个 Node.js 脚本，用于自动在[掘金](https://juejin.cn/)网站上进行每日签到和免费抽奖，以帮助用户自动获取矿石和相关奖励。

## 功能

-   自动进行每日签到。
-   自动进行每日免费抽奖。
-   通过保存登录状态，避免每次运行时都重新登录。

## 工作原理

脚本使用 [Playwright](https://playwright.dev/) 库来模拟浏览器操作。

1.  **`setupAuth.js`**: 这个脚本会启动一个浏览器实例，让用户手动登录一次掘金。成功登录后，它会将当前页面的登录状态（如 Cookies 和 Local Storage）保存到 `auth.json` 文件中。
2.  **`main.js`**: 这个主脚本会读取 `auth.json` 文件中的登录状态，然后启动一个无头浏览器（在后台运行，没有图形界面）。它会利用已保存的登录信息直接访问掘金的签到和抽奖页面，并执行相应的点击操作。

## 使用方法

### 1. 环境准备

-   确保你的电脑上已经安装了 [Node.js](https://nodejs.org/) (建议使用 LTS 版本)。

### 2. 安装依赖

在项目根目录下打开终端，运行以下命令来安装项目所需的依赖库：

```bash
npm install
```

### 3. 设置登录凭证

这是最关键的一步。运行以下命令，脚本会打开一个浏览器窗口，请在该窗口中手动登录你的掘金账号：

```bash
node setupAuth.js
```

登录成功后，回到终端，按 `Enter` 键。脚本会将你的登录状态保存到 `auth.json` 文件中。

**注意**：请务必保管好 `auth.json` 文件，不要泄露给他人，因为它包含了你的登录凭证。

### 4. 运行主程序

完成以上步骤后，你就可以运行主脚本来自动执行签到和抽奖了：

```bash
node main.js
```

脚本会自动完成操作并输出日志。

### 5. (可选) 设置定时任务

为了实现每日自动运行，你可以使用系统的定时任务功能（如 Linux/macOS 的 `cron` 或 Windows 的 `Task Scheduler`）来定时执行 `node main.js` 命令。

例如，在 Linux 或 macOS 上，你可以这样设置每天早上10点执行：

```bash
# 编辑 crontab
crontab -e

# 添加以下内容 (请将 /path/to/your/project 替换为你的项目实际路径)
0 10 * * * cd /path/to/your/project && node main.js >> /path/to/your/project/cron.log 2>&1
```

## 项目文件说明

-   `main.js`: 自动签到和抽奖的主脚本。
-   `setupAuth.js`: 用于生成 `auth.json` 登录凭证文件的脚本。
-   `package.json`: Node.js 项目配置文件，包含了项目依赖等信息。
-   `auth.json`: (自动生成) 保存用户登录状态的文件。**请勿将此文件提交到公共代码库。**
-   `.gitignore`: Git 配置文件，已默认忽略 `node_modules` 和 `auth.json`。

## 注意事项

-   如果脚本运行失败，可以尝试重新运行 `node setupAuth.js` 来更新登录凭证。
-   网站的页面结构可能会发生变化，导致脚本失效。如果遇到问题，可能需要根据最新的页面结构更新 `main.js` 中的选择器。
