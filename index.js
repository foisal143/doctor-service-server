const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('service data is comming');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mrvtr8q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceColection = client
      .db('doctorServiceDB')
      .collection('services');
    const bookedServiceColection = client
      .db('bookedServiceDB')
      .collection('bookedServices');
    app.get('/services', async (req, res) => {
      const services = serviceColection.find();
      const result = await services.toArray();
      res.send(result);
    });

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await serviceColection.findOne(quary);
      res.send(result);
    });

    // booked service section
    app.post('/booked-service', async (req, res) => {
      const booked = req.body;
      const result = await bookedServiceColection.insertOne(booked);
      res.send(result);
    });

    app.get('/booked-service', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      let quary = {};
      if (quary) {
        quary = { email: email };
      }
      const result = await bookedServiceColection.find(quary).toArray();
      console.log(result);
      res.send(result);
    });

    app.patch('/booked-service/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const service = req.body;

      const updatedService = {
        $set: {
          status: service.status,
        },
      };
      const result = await bookedServiceColection.updateOne(
        quary,
        updatedService
      );
      res.send(result);
    });

    app.delete('/booked-service/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await bookedServiceColection.deleteOne(quary);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log('server is running on port', port);
});
