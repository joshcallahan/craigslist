const request = require("request-promise");
const cheerio = require("cheerio");
const ObjectsToCsv = require('objects-to-csv');

const url = "https://toronto.craigslist.org/search/jjj?s=";

const scrapeSample = {
  title: "Technical Autonomous Vehicle Trainer",
  description:
    "We're the driverless car company. We're building the world's best autonomous vehicles to safely connect people to the places, things, and experiences they care about.",
  datePosted: new Date("2018-07-13"),
  url:
    "https://sfbay.craigslist.org/sfc/sof/d/technical-autonomous-vehicle/6642626746.html",
  hood: "(SOMA / south beach)",
  address: "1201 Bryant St.",
  compensation: "23/hr"
};

const scrapeResults = [];

async function scrapeJobHeader() {
  try {
    for (let index = 0; index <= 120; index += 120) {
      const htmlResult = await request.get("https://toronto.craigslist.org/search/jjj?s=" + index);
      const $ = await cheerio.load(htmlResult);
  
      $(".result-info").each((index, element) => {
        const resultTitle = $(element).children(".result-title");
        const title = resultTitle.text();
        const url = resultTitle.attr("href");
        const datePosted = $(element)
          .children("time")
          .attr("datetime");
        const hood = $(element)
          .find(".result-hood")
          .text();
        const scrapeResult = { title, url, datePosted, hood };
        scrapeResults.push(scrapeResult);
      });
    }
    return scrapeResults;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeDescription(jobsWithHeaders) {
  return await Promise.all(
    jobsWithHeaders.map(async job => {
      try {
        const htmlResult = await request.get(job.url);
        const $ = await cheerio.load(htmlResult);
        $(".print-qrcode-container").remove();
        job.description = $("#postingbody").text();
        job.address = $("div.mapaddress").text();
        const compensationText = $(".attrgroup")
          .children()
          .first()
          .text();
        job.compensation = compensationText.replace("compensation: ", "");
        return job;
      } catch (error) {
        console.error(error);
      }
    })
  );
}

async function createCsvFile(data) {
  let csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk('./test.csv');
}

async function scrapeCraigslist() {
  const jobsWithHeaders = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  await createCsvFile(jobsFullData);
}

scrapeCraigslist();