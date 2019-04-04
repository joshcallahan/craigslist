const request = require('request-promise');
const cheerio = require('cheerio');

const url = "https://toronto.craigslist.org/d/software-qa-dba-etc/search/sof";

async function scrapeCraigslist() {
  try {
    const htmlResult = await request.get(url);
    console.log(htmlResult);
  } catch (err) {
    console.error(err);
  }


}

scrapeCrasigslist();
