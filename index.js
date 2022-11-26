const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(cors());
app.use(express.json());

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.if9xwsm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        //collections
        const carsCollection = client.db('heroCarsData').collection('cars');
        

        // APIs
        app.get('/cars', async(req, res) => {
            const query = {};
            const cars = await carsCollection.find(query).toArray();
            res.send(cars);
        });

        app.get('/cars/:category', async(req, res) => {
            const category = req.params.category;
            const query = {category: category};
            const perCategory = await carsCollection.find(query).toArray();
            res.send(perCategory);
        })
    }
    finally{

    }
}
run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('Hero cars is running')
});

app.listen(port, () => {
    console.log(`Hero cars running on the port, ${port}`)
})