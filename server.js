// server.js - COMPLETE VERSION WITH BOOKING LOGIC

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

// 5. DEFINE SCHEMAS AND MODELS
// =================================================

// --- Schema for Vehicles ---
const vehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number
});
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// --- Schema for Bookings (THIS WAS MISSING) ---
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

// Replaced your old GET /api/vehicles route with this new async version

app.get('/api/vehicles', async (req, res) => {
  try {
    // Get the current date, ignoring the time of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. First, get all vehicles from the database
    const allVehicles = await Vehicle.find();

    // 2. For each vehicle, check if it has a booking that includes today's date
    const vehiclesWithAvailability = await Promise.all(
      allVehicles.map(async (vehicle) => {
        const conflictingBooking = await Booking.findOne({
          vehicleName: vehicle.name, // Find bookings for this specific vehicle
          startDate: { $lte: today }, // Where the booking started on or before today
          endDate: { $gte: today }     // And ends on or after today
        });

        // 3. Convert to a plain object and add the new isAvailable property
        const vehicleObject = vehicle.toObject();
        vehicleObject.isAvailable = conflictingBooking ? false : true; // If a booking is found, it's not available
        return vehicleObject;
      })
    );

    // 4. Send the final, enhanced list to the frontend
    res.json(vehiclesWithAvailability);

  } catch (err) {
    console.error('Error fetching vehicles with availability:', err);
    res.status(500).json({ error: 'An error occurred while fetching vehicles' });
  }
});

// --- Route for Bookings (THIS WAS MISSING) ---
app.post('/api/bookings', (req, res) => {
  const newBooking = new Booking(req.body);
  newBooking.save()
    .then(savedBooking => {
      // (Optional email logic would go here)
      console.log('Booking saved:', savedBooking);
      res.status(201).json(savedBooking);
    })
    .catch(err => {
      console.log('Booking save error:', err);
      res.status(400).json({ error: 'Failed to create booking' });
    });
});


// 7. START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});