// server.js

// 1. IMPORTS
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 2. INITIALIZE APP
const app = express();
const PORT = 5000;

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. DATABASE CONNECTION
const dbURI = 'mongodb+srv://rideease_user:Sosangkar11@cluster0.cejgzto.mongodb.net/rideeaseDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then((result) => console.log('Connected to the database'))
  .catch((err) => console.log(err));

// 5. DEFINE A SCHEMA AND MODEL
const vehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// 6. API ROUTES
// =================================================

// --- GET All Vehicles ---
app.get('/api/vehicles', (req, res) => {
  Vehicle.find()
    .then(vehicles => {
      res.json(vehicles);
    })
    .catch(err => {
      res.status(500).json({ error: 'An error occurred' });
    });
});

// --- POST a New Vehicle ---
app.post('/api/vehicles', (req, res) => {
  const vehicleData = req.body;
  const newVehicle = new Vehicle(vehicleData);
  newVehicle.save()
    .then(savedVehicle => {
      res.status(201).json(savedVehicle);
    })
    .catch(err => {
      res.status(400).json({ error: 'Failed to add vehicle' });
    });
});

// 7. START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});