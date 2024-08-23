const fs = require("fs");
const https = require("https");
require('dotenv').config();

const DEEPGRAM_URL = "https://api.deepgram.com/v1/speak?model=aura-luna-en";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const payload = JSON.stringify({
  text: "Hello Ajay nice to meet you, My name is anima your voice assistant build by expro. how can i help you.",
});

const requestConfig = {
  method: "POST",
  headers: {
    Authorization: `Token ${DEEPGRAM_API_KEY}`,
    "Content-Type": "application/json",
  },
};

const audioFilePath = "output.mp3"; // Path to save the audio file

const fileStream = fs.createWriteStream(audioFilePath); // Create a file stream to write the audio to

const req = https.request(DEEPGRAM_URL, requestConfig, (res) => {
  res.on("data", (chunk) => {
    fileStream.write(chunk); // Stream audio to the file
  });

  res.on("end", () => {
    console.log("Audio download complete");
    fileStream.end(); // Close the file stream once the response ends
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.write(payload);
req.end();
