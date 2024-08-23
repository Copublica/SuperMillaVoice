const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@deepgram/sdk');
const fs = require('fs').promises; 
const cors = require('cors');
const path = require('path');

require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const getAudio = async (text) => {
  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en',
        encoding: 'linear16',
        container: 'wav',
      }
    );

    const stream = await response.getStream();
    const buffer = await getAudioBuffer(stream);

    const filePath = path.join(__dirname, 'output.wav');
    await fs.writeFile(filePath, buffer);

    console.log('Audio file written to output.wav');
    
    return filePath;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error;
  }
};

const getAudioBuffer = async (response) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return Buffer.from(dataArray.buffer);
};

app.post('/answer', async (req, res) => {
  const { answer } = req.body;
  if (answer) {
    try {
      const filePath = await getAudio(answer);
      res.status(200).sendFile(filePath);
    } catch (error) {
      res.status(500).send('Error generating audio');
    }
  } else {
    res.status(400).send('No answer provided.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});