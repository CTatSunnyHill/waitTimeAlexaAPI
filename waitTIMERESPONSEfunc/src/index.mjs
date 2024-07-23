import https from 'https';

export const handler = async (event) => {
  try {
    // Fetch data from the API
    const data = await fetchData('https://waittimealexaapi.onrender.com');
    
    // Parse the data to get hospital names and wait times
    const waitTimes = parseWaitTimes(data);

    // Construct the response for Alexa
    const response = buildAlexaResponse(waitTimes);

    return response;
  } catch (error) {
    console.error('Error fetching or processing data:', error);

    // Return an error response for Alexa
    return buildErrorResponse();
  }
};

// Function to fetch data from the given URL
const fetchData = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Function to parse wait times from the fetched data
const parseWaitTimes = (data) => {
  return data.map(hospital => {
    const name = hospital.name;
    const waitTime = hospital.waitTime; // Ensure this is the correct field name
    return `${name} has a wait time of ${waitTime}.`;
  }).join(' ');
};

// Function to build a response for Alexa
const buildAlexaResponse = (waitTimes) => {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `Here are the wait times: ${waitTimes} `,
      },
      shouldEndSession: true,
    },
  };
};

// Function to build an error response for Alexa
const buildErrorResponse = () => {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'Sorry, I couldn\'t retrieve the wait times. Please try again later.',
      },
      shouldEndSession: true,
    },
  };
};

