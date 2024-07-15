const express = require('express');
const puppeteer = require('puppeteer');


const app = express();
const port = 3000;

app.get('/api/hospitals', async (req,res) => {

    try {
        const browser = await puppeteer.launch({
            //executablePath: process.env.CHROME_BIN || '/usr/bin/chromium-browser', // Ensure the correct path
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    
        const page = await browser.newPage();
    
        await page.goto('https://edwaittimes.ca/welcome');
    
        await page.waitForSelector('#edwt-address-search-input');
        await page.click('#edwt-address-search-input');
    
        await page.type('#edwt-address-search-input', "NICU Neonatal Intensive Care Unit, 4500 Oak St, Vancouver, British Columbia V5Z 2H6, Canada", { delay : 100 });
        await page.click('button.m-1.flex');
    
        // Wait for the results to load
        await page.waitForSelector('.group.md\\:cursor-pointer', { visible: true });
    
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
    
        await browser.close();
    
        res.json(hospitalData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

   

