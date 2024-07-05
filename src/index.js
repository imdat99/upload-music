import { connect } from 'puppeteer-real-browser';
import { uploadModule } from './upload.js';
import { killProcess } from './helper.js';
const ripUrl = "https://doubledouble.top/";
const trackList = [
    "https://open.spotify.com/track/3Alwi53Ahc2GwHgvel42b2",
    "https://open.spotify.com/track/31VNCmwspR7nVJ6kruUuJt",
    "https://open.spotify.com/track/6xKs4CnVadRzdNZ48vhT27",
];

const browserWorker = (trackUrl) => connect({
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
    await page.setCacheEnabled()
    await page.goto(ripUrl, {
        waitUntil: "networkidle0" ,
    });
    await page.waitForSelector("#dl-input");
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
    const data = await new Promise((resolve, reject) => {
        page.on('request', request => {
            page
              .$eval('#error[style="display: inline-block;"]', () => true)
              .then((r) => {
                if(r) {
                    page.screenshot({ path: 'example.png', fullPage: true }).catch(e => console.log(e.message));
                    // response.browser.close();
                    // reject(new Error("Error"));
                }
              })
              .catch(() => {});
            const url = request.url();
            if (String(url).toLowerCase().endsWith('.mp3')) {
                response.browser.close();
                uploadModule(url).then(r => {
                    resolve({...r, trackUrl });
                })
            }
            else
              request.continue();
        });
    });
    return data;
}).catch((e) => {
    console.log("error", e)
})

const main = async () => {
    for (const trackUrl of trackList) {
        const data = await browserWorker(trackUrl);
        console.log("data", data)
        if(trackList.indexOf(trackUrl) === trackList.length - 1)
            console.log("done!")
    }
}

main().then().catch(killProcess)
{/* <div id="error" style="display: inline-block;">
        <h1 class="icon">error</h1>
        <p id="errText">An error occured while attaching and verifying metadata. This is a known issue, please wait a bit and try your request again.</p>
      </div> */}