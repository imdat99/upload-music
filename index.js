import { connect } from 'puppeteer-real-browser';
import { uploadModule } from './upload.js';
const ripUrl = "https://doubledouble.top/";
const trackList = [
    "https://open.spotify.com/track/3Alwi53Ahc2GwHgvel42b2",
    "https://open.spotify.com/track/31VNCmwspR7nVJ6kruUuJt",
    "https://open.spotify.com/track/6xKs4CnVadRzdNZ48vhT27",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const worker = async ( page, trackUrl) => {
    // setTarget({ status: false });
    // let page = await browser.newPage();
    // setTarget({ status: true });
   
    await page.evaluate(
        (text) => {
            document.querySelector("#dl-input").value = text
            // document.getElementById("external").checked = true;
            document.getElementById("format").value = "mp3";
            document.getElementById("metadata").checked = false;
            document.getElementById("dl-button").click()
        },
        trackUrl,
    );
    await page.setRequestInterception(true);
    return new Promise((resolve) => {
        page.on('request', request => {
            const url = request.url();
            if (String(url).toLowerCase().endsWith('.mp3')) {
                request.abort();
                resolve(url);
            }
            else
              request.continue();
        });
    });
};

connect({
    headless: "auto",
    args: ["--no-sandbox", '--disable-features=site-per-process'],
    customConfig: {},
    skipTarget: [],
    fingerprint: false,
    turnstile: true,
    connectOption: {},
})
.then(async response => {
    const {page}=response;
    await page.setDefaultTimeout(200000);
    await page.goto(ripUrl, {
        waitUntil: "networkidle0" ,
    });
    await page.waitForSelector("a.underline");
    for (const trackUrl of trackList) {
        const url = await worker(page, trackUrl);
        await uploadModule(url);
        // await page.reload(ripUrl);
        if(trackList.indexOf(trackUrl) === trackList.length - 1)
            response.browser.close();
    }
 
   
})
.catch(error=>{
    console.log(error.message)
})