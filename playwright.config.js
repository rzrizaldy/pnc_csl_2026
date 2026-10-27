const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
 testDir: './tests', workers: 1, fullyParallel: false, reporter: 'list',
 use: { baseURL: 'http://127.0.0.1:4311', headless: true, trace: 'retain-on-failure', launchOptions: process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {} },
 webServer: {command:'python3 -m http.server 4311 --bind 127.0.0.1', url:'http://127.0.0.1:4311', reuseExistingServer:!process.env.CI},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}]
});
