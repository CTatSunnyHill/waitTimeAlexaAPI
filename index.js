const express = require('express'); // Import the express module
const puppeteer = require('puppeteer'); // Import the puppeteer module
require("dotenv").config(); // Load environment variables from .env file


const app = express(); // Create an express application
const PORT = process.env.PORT || 3000; // Define the port on which the server will run

// Define the root route
app.get('/', async (req, res) => {

    // Launch a new Puppeteer browser instance
    const browser = await puppeteer.launch({ 
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        headless: true,
        protocolTimeout: 240000,
        executablePath: 
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH // Use custom executable path in production
          : puppeteer.executablePath(), // Use default executable path in development
        timeout: 60000 // Set a timeout of 60 seconds for launching the browser
     });

    try { 
        const page = await browser.newPage(); // Open a new page

        // Navigate to the specified URL
        await page.goto('https://edwaittimes.ca/welcome', { timeout: 60000 });

        // Wait for the search input element to appear
        await page.waitForSelector('#edwt-address-search-input', { timeout: 30000 });
        await page.click('#edwt-address-search-input'); // Click on the search input element

        // Type the address into the search input element
        await page.type('#edwt-address-search-input', "NICU Neonatal Intensive Care Unit, 4500 Oak St, Vancouver, British Columbia V5Z 2H6, Canada");
        await page.click('button.m-1.flex'); // Click the search button

        // Wait for the results to load
        await page.waitForSelector('.group.md\\:cursor-pointer', { visible: true, timeout: 30000 });

        console.log("Results are loaded");

        // Extract the hospital names and their wait times
        const hospitalData = await page.evaluate(() => {
            const hospitals = [];
            const items = document.querySelectorAll('.group.md\\:cursor-pointer');

            // Iterate through each result item and extract the required details
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
        res.json(hospitalData); // Send the extracted data as JSON response
    } catch (e){
        console.error('Error occurred:', e);
        res.status(500).send("Something went wrong"); // Send a 500 error response if an exception occurs
    } finally{
        if (browser) {
          await browser.close(); // Close the browser instance
        }
    }
});

// Start the server and listen on the defined port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on ${PORT}`);
});

