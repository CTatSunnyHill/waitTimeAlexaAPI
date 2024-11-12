import http from 'http';
 
export const handler = async (event) => {
  
 
  try {
    
    // Fetch data from the API
    const data = await fetchData('http://54.166.231.78:3001/')
 
    // Define hospital name and their wait times in a variable
    const hospitalName = "BC Children's Hospital";
    const waitTime = parseWaitTimes(data, hospitalName);
 
    
    
    // Parse the data to get hospital names and wait times
    // const waitTimes = parseWaitTimes(data);
 
    // Construct the response for Alexa
    const response = buildAlexaResponse(waitTime, hospitalName);
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
    http.get(url, (res) => {
      let data = '';
      // Handle Data chunks
      res.on('data', (chunk) => {
        data += chunk;
      });
       // End Event
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
      // Error Event Handling
    }).on('error', (err) => {
      reject(err);
    });
  });
};
 
// Function to parse wait times from the fetched data and not limited to Sunny Hill Health Centre
// const parseWaitTimes = (data) => {
//   return data.map(hospital => {
//     const name = hospital.name;
//     const waitTime = hospital.waitTime; // Ensure this is the correct field name
//     return `${name} has a wait time of ${waitTime}.`;
//   }).join(' ');
// };
 
// Function to parse wait times for Alexa Skill limited to Sunny Hill Health Centre
const parseWaitTimes = (data, hospitalName) => {
  const hospital = data.find(hospital => hospital.name === hospitalName);
  return hospital ? `${hospital.name} has a wait time of ${hospital.waitTime}.` : `No data found for ${hospitalName}.`;
};
 
// Function to build a response for Alexa
const buildAlexaResponse = (waitTime, hospitalName) => {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: waitTime,
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
 