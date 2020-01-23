/* const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000; */

const express = require("express");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("database.json");

const app = express();
const database = lowdb(adapter);
const port = process.env.PORT || 3001;

app.use(express.static("public"));
app.use(express.json());

// DATABASE
const initiateDatabase = () => {
  const hasProducts = database.has("products").value();
  const hasCart = database.has("cart").value();

  if (!hasProducts) {
    database.defaults({ products: [], cart: [] }).write();
  }

  if (!hasCart) {
    database.defaults({ products: [], cart: [] }).write();
  }
};

// ADD NEW PRODUCT
const newProduct = async (name, price, imgurl) => {
  const response = await database
    .get("products")
    .push({ name, price, imgurl })
    .write();
  return response;
};

app.post("/api/products", async (request, response) => {
  let message = {
    success: true,
    message: "New product added"
  };

  const { name, price, imgurl } = request.query;
  const res = await newProduct(name, price, imgurl);
  message.data = res[res.length - 1];
  console.log(message.data);
  return response.send(message);
});

// ADD TO CART
const add = async name => {
  let response = "";
  let product = await database
    .get("products")
    .find({ name })
    .value();

  if (product) {
    response = await database
      .get("cart")
      .push({ product })
      .write();
    return response;
  }
  return response;
};

app.post("/api/cart", async (request, response) => {
  let message = {
    success: true,
    message: "Product added to cart"
  };

  if (typeof response == "string" || str instanceof String) {
    message = {
      success: false,
      message: "No product added"
    };
  }
  const { name } = request.query;
  const res = await add(name);
  if (res.length > 0) {
    message.data = res[res.length - 1];
  }
  return response.send(message);
});

// DELETE FROM CART
const remove = async name => {
  const response = await database
    .get("cart")
    .remove({ name })
    .write();
  return response;
};

app.delete("/api/cart", async (request, response) => {
  let message = {
    success: true,
    message: "Product removed"
  };

  const { name } = request.query;
  const res = await remove(name);
  message.data = res[0];
  return response.send(message);
});

// GET CART
app.get("/api/showCart", (req, res) => {
  let message = {
    success: true,
    message: "Cart found"
  };
  //res = database.get("cart").value();
  res.json(database.get("cart").value());

  return res;
});

/* app.use(cors());

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const pool = new Pool({
    user: 'tilda',
    host: 'localhost',
    database: 'products',
    port: 5432
});

pool.connect(); */

app.listen(port, () => {
  console.log("Server started on port: ", port);
  initiateDatabase();
});
