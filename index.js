const express = require('express');
const puppeteer = require('puppeteer');
require("dotenv").config();
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req,res) => {

    const browser = await puppeteer.launch({ 
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        headless: false, 
        executablePath: 
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
        timeout: 60000
     });

  try { 
    const page = await browser.newPage();

    await page.goto('https://edwaittimes.ca/welcome', { timeout: 60000 });

    await page.waitForSelector('#edwt-address-search-input', { timeout: 30000 });
    await page.click('#edwt-address-search-input');

    await page.type('#edwt-address-search-input', "NICU Neonatal Intensive Care Unit, 4500 Oak St, Vancouver, British Columbia V5Z 2H6, Canada");
    await page.click('button.m-1.flex');

    // Wait for the results to load
    await page.waitForSelector('.group.md\\:cursor-pointer', { visible: true, timeout: 30000 });

    console.log("Results are loaded");

    // Extract the hospital names and their wait times
    const hospitalData = await page.evaluate(() => {
        const hospitals = [];
        const items = document.querySelectorAll('.group.md\\:cursor-pointer');

        items.forEach(item => {
            const nameElement = item.querySelector('h3.py-1\\.5.text-xl.font-bold.leading-6');
            const waitTimeElement = item.querySelector('.text-2xl.font-bold.text-blue .flex.gap-1');

            if (nameElement && waitTimeElement) {
                const name = nameElement.innerText;
                const waitTime = Array.from(waitTimeElement.children).map(span => span.innerText).join(' '); // Combine hours and minutes
                hospitals.push({ name, waitTime });
            }
        });

        return hospitals;
    });
    console.log("Extracted data:", hospitalData);
    res.json(hospitalData);
} catch (e){
    console.error('Error occurred:', e);
    res.status(500).send("Something went wrong");
} finally{
    if (browser) {
      await browser.close();
    }
}
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// async function getRemoteData() {
//     try {
//         const response = await axios.get('https://waittimealexaapi.onrender.com/', {
//             timeout: 60000 // Increase timeout to 60 seconds
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching remote data:", error);
//         throw new Error('Unable to fetch remote data.');
//     }
// }

// async function displayHospitalWaitTimes() {
//     try {
//         const data = await getRemoteData();
//         data.forEach(hospital => {
//             console.log(`${hospital.name} has a wait time of ${hospital.waitTime}`);
//         });
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// displayHospitalWaitTimes();




   

