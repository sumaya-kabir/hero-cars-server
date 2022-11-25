const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Hero cars is running')
});

app.listen(port, () => {
    console.log(`Hero cars running on the port, ${port}`)
})