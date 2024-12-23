const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()


const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.csr0o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const db = client.db('solo-db')
        const foodCollection = db.collection('foods')

        app.post('/add-food', async (req, res)=>{
            const foodData = req.body
            const result = await foodCollection.insertOne(foodData)
            console.log(result)
            res.send(result)
        })


        app.get('/all-foods', async(req, res)=>{
            const result = await foodCollection.find({}).toArray()
            res.send(result)
        })


        app.get('/all-foods/:email', async (req, res)=>{
            const email = req.params.email
            const query = {'addedBy.email': email}
            const result = await foodCollection.find(query).toArray()
            res.send(result)
        })


        app.delete('/food/:id', async (req, res)=>{
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })




        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('restaurant is open now')
})


app.listen(port, () => {
    console.log(`Yeeeeeeeeee ${port}`)
})







