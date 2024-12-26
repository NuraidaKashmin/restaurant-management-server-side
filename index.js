const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()


const moment = require('moment');


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
        const ordersCollection = db.collection('orders')

        

        app.post('/add-food', async (req, res) => {
            const foodData = { ...req.body, purchaseCount: 0 };
            const result = await foodCollection.insertOne(foodData);
            res.send(result);
        });


        app.get('/all-foods', async (req, res) => {
            const result = await foodCollection.find({}).toArray()
            res.send(result)
        })


        app.get('/all-foods/:email', async (req, res) => {
            const email = req.params.email
            const query = { 'addedBy.email': email }
            const result = await foodCollection.find(query).toArray()
            res.send(result)
        })


        app.delete('/food/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/food/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)
        })


       

app.put('/update-food/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFood = req.body;

    if (!id || !updatedFood) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        
        delete updatedFood._id;

        const result = await foodCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedFood }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Food item updated successfully' });
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






app.post('/food-purchased/:id', async (req, res) => {
    try {
        const { quantity, buyerEmail, buyerName  } = req.body;
        const foodId = req.params.id;

        

        const food = await foodCollection.findOne({ _id: new ObjectId(foodId) });

        if (!food) {
            return res.status(404).json({ error: "Food item not found" });
        }

        if (food.quantity < quantity) {
            return res.status(400).json({ error: "Not enough stock available" });
        }

        if (food.addedBy?.email === buyerEmail) {
            return res.status(403).json({ error: "You cannot purchase your own food item." });
        }

        const updatedQuantity = food.quantity - quantity;


   


  
    await foodCollection.updateOne(
        { _id: new ObjectId(foodId) },
        {
            $set: { quantity: updatedQuantity },
            $inc: { purchaseCount: 1 }
        }
    );

    
    const purchaseData = {
        foodId: new ObjectId(foodId),
        foodName: food.name,
        quantity,
        buyerName,
        buyerEmail,
        price: food.price * quantity,
        buyingDate: new Date()
    };

    const orderResult = await ordersCollection.insertOne(purchaseData);

    res.status(200).json({ message: "Purchase successful!", orderResult });
} catch (err) {
    console.error("Error processing purchase:", err);
    res.status(500).json({ error: "Error processing purchase." });
}



});





app.get('/top-foods', async (req, res) => {
    try {
        const topFoods = await foodCollection.find({})
            .sort({ purchaseCount: -1 })  
            .limit(6)  
            .toArray();

        res.json(topFoods);
    } catch (error) {
        console.error('Error fetching top foods:', error);
        res.status(500).json({ error: 'Failed to fetch top foods' });
    }
});








        
        await client.connect();
        
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('restaurant is open now')
})


app.listen(port, () => {
    console.log(`Yeeeeeeeeee ${port}`)
})







