const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const apiKey = "AIzaSyA0xMFZ9lxS8CWEkefqcqgJdgnVwt2fonY"; // Google Maps API Key

const app = express();
const uri = 'mongodb+srv://anshrkdk1998:Dksgkp123@zoelweb.xuzat.mongodb.net/?retryWrites=true&w=majority&appName=ZOELWEB';
const client = new MongoClient(uri);

let carousel;
let database;
let categories;
let solutions;

// Initialize MongoDB connection
async function initialize() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    database = client.db('zoel_india');
    categories = database.collection('categories');
    solutions = database.collection('solutions');
    carousel = database.collection('carousel');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit the process if the connection fails
  }
}

app.use(cors());

// Fetch categories from MongoDB
app.get('/categories', async (req, res) => {
  try {
    const data = await categories.find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

app.get('/carousel', async (req, res) => {
  try {
    const data = await carousel.find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Sliders', error });
  }
});
// Fetch products under a specific category from MongoDB
app.get('/categories/:categoryTitle/products', async (req, res) => {
  const categoryTitle = req.params.categoryTitle;

  try {
    const category = await categories.findOne({ categoryName: categoryTitle });

    if (category) {
      res.json(category.products);  // Send the products array back
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category products', error });
  }
});

// Fetch solutions from MongoDB
app.get('/solutions', async (req, res) => {
  try {
    const data = await solutions.find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching solutions', error });
  }
});

// New Route: Fetch coordinates for a given address using Google Maps Geocoding API
app.get('/getCoordinates', async (req, res) => {
  const address = req.query.address;  // Get the address from the query string

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await axios.get(geocodeUrl);

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      res.json({
        lat: location.lat,
        lng: location.lng,
      });
    } else {
      res.status(400).json({ error: "Geocoding failed", status: response.data.status });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coordinates', details: error.message });
  }
});

// Start the server and initialize MongoDB connection
app.listen(3000, async () => {
  await initialize();  // Initialize the MongoDB connection
  console.log('Server is running on port 3000');
});
