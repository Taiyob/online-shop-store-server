const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { status } = require("express/lib/response");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://shop_store:qNTsj1H26kQYLwkR@cluster0.9bycbcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("shop-store").collection("users");
    const recipesCollection = client.db("shop-store").collection("recipes");
    const categoriesCollection = client
      .db("shop-store")
      .collection("categories");

    app.post("/user", async (req, res) => {
      const body = req.body;
      const userExist = await usersCollection.findOne({ email: body?.email });
      if (userExist?._id) {
        return res.send({
          status: "success",
          message: "Login success & already save in database",
        });
      }
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    app.get("/get/user/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email: email });
      res.send(result);
    });

    app.get("/recipes", async (req, res) => {
      console.log("pagination", req.query);
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      try {
        const result = await recipesCollection
          .find({}, { price: 1 })
          .skip(page * size)
          .limit(size)
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    app.get("/recipesCount", async (req, res) => {
      const count = await recipesCollection.estimatedDocumentCount();
      res.send({ count });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
