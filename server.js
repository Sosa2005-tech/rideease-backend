// server.js - DEFINITIVE FINAL VERSION

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
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.log('DB Connection Error:', err));

// 5. DEFINE SCHEMAS AND MODELS
const vehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number
});
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const bookingSchema = new mongoose.Schema({
  vehicleName: String,
  customerName: String,
  customerEmail: String,
  startDate: Date,
  endDate: Date,
  totalPrice: Number
});
const Booking = mongoose.model('Booking', bookingSchema);


// 6. API ROUTES
// =================================================

// --- GET All Vehicles (with Availability Status) ---
// server.js
// Replace the GET /api/vehicles route with this final version

app.get('/api/vehicles', async (req, res) => {
  try {
    // --- NEW: More robust date logic ---
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    // --- END NEW ---

    const allVehicles = await Vehicle.find();

    const vehiclesWithAvailability = await Promise.all(
      allVehicles.map(async (vehicle) => {

        // --- UPDATED QUERY ---
        const conflictingBooking = await Booking.findOne({
          vehicleName: vehicle.name,
          startDate: { $lte: endOfToday },   // Booking starts before today ends
          endDate: { $gte: startOfToday }    // And ends after today begins
        });
        // --- END UPDATED ---

        const vehicleObject = vehicle.toObject();
        vehicleObject.isAvailable = conflictingBooking ? false : true;
        return vehicleObject;
      })
    );

    res.json(vehiclesWithAvailability);

  } catch (err) {
    console.error('Error fetching vehicles with availability:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});
// --- POST a New Booking (with Double-Booking Prevention) ---
app.post('/api/bookings', async (req, res) => {
  try {
    const { vehicleName, startDate, endDate } = req.body;

    // Convert string dates from the form into Date objects
    const newBookingStart = new Date(startDate);
    const newBookingEnd = new Date(endDate);

    // 1. Check for conflicting bookings BEFORE saving
    const existingBooking = await Booking.findOne({
      vehicleName: vehicleName,
      $or: [
        { startDate: { $lte: newBookingEnd, $gte: newBookingStart } },
        { endDate: { $lte: newBookingEnd, $gte: newBookingStart } }
      ]
    });

    // 2. If a conflict is found, send an error
    if (existingBooking) {
      return res.status(409).json({ message: 'Sorry, this vehicle is already booked for the selected dates.' });
    }

    // 3. If no conflict, proceed to save the new booking
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    
    console.log('Booking saved:', savedBooking);
    res.status(201).json(savedBooking);

  } catch (err) {
    console.log('Booking save error:', err);
    res.status(400).json({ error: 'Failed to create booking' });
  }
});


// 7. START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});