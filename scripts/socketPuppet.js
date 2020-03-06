const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const Bluebird = require('bluebird');
fetch.Promise = Bluebird;

// parsing cli arguments
const program = require('commander');
program
  .option('--env <type>', 'production or development?', 'development')
  .option('--limit <type>', 'number of sockets to open', 10)
  .option('-H, --headless', 'headless mode?', true)
  .option('-r, --redirectLog', 'redirect logs?', false)
  .option('--screenshot <type>', 'screenshot export path');
program.parse(process.argv);


const SERVER_CONFIG = {
  production: {
    serverLocation: 'https://api-staging.beopen.app/v1/auth/apple',
    deviceUniqueId: 'dd96dec43fb81c97'
  },
  development: {
    serverLocation: 'http://localhost:4000/v1/auth/apple',
    deviceUniqueId: 'd1'
  },
} 
// building config object
const config = {
  limit: program.limit,
  headless: program.headless,
  redirectLog: program.redirectLog,
  screenshot: program.screenshot,
  ...SERVER_CONFIG[program.env]
}

// Fetching tokens (Apple login)
async function fetchTokensFromAppleAuth(url, limit) {
  const appleIdPrefix = '13423214123124243';
  const appleIdSuffixInt = 35;
  const deviceUniqueId = config.deviceUniqueId;

  const fetchedTokens = [];
  for (let i = 0; i < limit; i++) {
    appleId = appleIdPrefix + (appleIdSuffixInt + i).toString();
    // console.log(`Fetching appleId ${appleId}`);
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appleId,
        deviceUniqueId
      })
    });
    const responseJson = await response.json();
    fetchedTokens.push(responseJson.accessToken);
  }
  return fetchedTokens;
}

// Immediately Invoke Function
(async () => {
  console.log('Fetching tokens...');
  const tokens = await fetchTokensFromAppleAuth(config.serverLocation, config.limit);
  console.log('Opening browser...');
  const browser = await puppeteer.launch({
    headless: config.headless,
  });
  const pages = [];
  for (let i = 0; i < config.limit; i++) {
    console.log(`Opening page ${i}...`);
    const page = await browser.newPage();
    pages.push(page);
    if (config.redirectLog) {
      page.on('console', message => {
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`)
        // console.log(message);
      }).on('pageerror', ({ message }) => 
        console.log(message)
      ).on('response', response =>
        console.log(`${response.status()} ${response.url()}`)
      ).on('requestfailed', request =>
        console.log(`${request.failure().errorText} ${request.url()}`)
      )
    }

    await page.goto('http://localhost:3000');
    await page.focus('#token');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Home');
    await page.keyboard.up('Shift');
    await page.keyboard.press('Backspace');
    await page.keyboard.sendCharacter(tokens[i]);
    await page.click('#login');

  }
  console.log(`Opened ${config.limit} sockets`);
  if (config.screenshot) {
    console.log('Capturing screenshot into "./puppets"...');
    for (let i = 0; i < pages.length; i++) {
      pages[i].screenshot({path: `${config.screenshot}/socket_puppet_${i}.png`});
    }
  }


  // node.js get keypress
  stdin = process.stdin;

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();
  // alter binary default 
  stdin.setEncoding( 'utf8' );

  // on any data into stdin
  stdin.on( 'data', async function( key ) {
    if ( key === 'close\n' ) {
      console.log('Closing browser...');
      await browser.close();
      process.exit();
    }
    });
})();