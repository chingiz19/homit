exports.config = {
    framework: 'jasmine',
    specs: ['./tests/frontend/e2e/**/*.test.js'],
    seleniumAddress: 'http://localhost:4444/wd/hub',
    getPageTimeout: 10000,
    highlightDelay: 500,
    multiCapabilities: [{
        browserName: 'firefox',
        'moz:firefoxOptions': {
            args: ["--headless"]
        }
    }, {
        browserName: 'chrome',
        chromeOptions: {
            // args: ["--headless", "--disable-gpu"]
        }
      }],
      jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        isVerbose: true,
        includeStackTrace: true
      }
  }