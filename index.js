const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(cors());
app.use(express.json());

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.if9xwsm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
        if(err){
            return res.status(403).send({message: "forbidden success"})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        //collections
        const carsCollection = client.db('heroCarsData').collection('cars');
        const bookingsCollection = client.db('heroCarsData').collection('bookings');
        const usersCollection = client.db('heroCarsData').collection('users');
        const advertiseCollection = client.db('heroCarsData').collection('advertise');
        
        const verifyAdmin = async(req, res, next) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
            next();
        }

        // APIs
        app.get('/cars', async(req, res) => {
            const query = {};
            const cars = await carsCollection.find(query).toArray();
            res.send(cars);
        });

        app.get('/myproducts', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cars = await carsCollection.find(query).toArray();
            res.send(cars);
        });

        app.delete('/myproducts/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await carsCollection.deleteOne(filter);
            res.send(result);
        });

        app.get('/cars/:category', async(req, res) => {
            const category = req.params.category;
            const query = {category: category};
            const perCategory = await carsCollection.find(query).toArray();
            res.send(perCategory);
        });

        app.post('/cars', async(req, res) => {
            const newProduct =req.body;
            const result = await carsCollection.insertOne(newProduct);
            res.send(result);
        });

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query ={email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1d'});
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
        });


        app.get('/bookings', verifyJWT, async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/bookings', async(req, res) => {
            const bookings =req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        });

        app.get('/sellers', async(req, res) => {
            const query = {role: "seller"};
            const seller = await usersCollection.find(query).toArray();
            res.send(seller)
        });

        app.post('/sellers', async(req,res) => {
            const sellers = req.body;
            const result = await usersCollection.insertOne(sellers);
            res.send(result)
        });

        app.delete('/sellers/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });

        app.get('/buyers', verifyJWT, async(req, res) => {
            const query = {role: "buyer"};
            const buyer = await usersCollection.find(query).toArray();
            res.send(buyer)
        });

        app.post('/buyers', async(req,res) => {
            const buyers = req.body;
            const result = await usersCollection.insertOne(buyers);
            res.send(result)
        });

        app.delete('/buyers/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });

        app.get('/advertise', verifyJWT, async(req, res) => {
            const query = {};
            const allAdvertise = await advertiseCollection.find(query).toArray();
            res.send(allAdvertise);
        })

        app.post('/advertise', async(req, res) => {
            const advertise = req.body;
            const result = await advertiseCollection.insertOne(advertise);
            res.send(result)
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