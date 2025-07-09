const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Casambi session API route
app.post('/getSession', async (req, res) => {
  const { api, email, password } = req.body;

  try {
    const response = await axios.post('https://door.casambi.com/v1/networks/session', {
      email,
      password
    }, {
      headers: {
        'X-Casambi-Key': api,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || 'Failed to fetch session.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});
