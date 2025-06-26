// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // Import bcrypt for password hashing
const jwt = require('jsonwebtoken');  // Import jwt for creating tokens
const app = express();

app.use(express.json());  // For parsing application/json
app.use(cors());  // For handling cross-origin requests

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://town-basket-admin:Townbasket@townbasket-cluster.xs4g17h.mongodb.net/?retryWrites=true&w=majority&appName=TownBasket-Cluster', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB", err));

// User model
const User = require('./models/User');  // Import User model

// User registration route
app.post('/register', async (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        // Save the user in the database
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        console.error("Error creating user:", err); // Log error for debugging
        res.status(500).json({ message: 'Error creating user', error: err });
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', {
        expiresIn: '1h', // Token expiration time
    });

    // Send the token and user details as response
    res.status(200).json({
        message: 'Login successful!',
        token,  // Send token to the frontend
        user: {
            name: user.name,
            email: user.email,
        },
    });
});

// User route to get user data after login
app.get('/user', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Verify the token
        const user = await User.findById(decoded.userId); // Find the user by the ID in the token

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

    res.status(200).json({
      name: user.name,
      email: user.email
    });// Send the user's name in the response
    } catch (err) {
        console.error("Error verifying token or fetching user data:", err);  // Log error for debugging
        res.status(500).json({ message: "Failed to fetch user data", error: err });
    }
});

// Test route to check server is working
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Port and server listening
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
