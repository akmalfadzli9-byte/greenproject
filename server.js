require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tanaman', require('./routes/tanaman'));
app.use('/api/sensor', require('./routes/sensor'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/notifikasi', require('./routes/notifikasi'));

// Real-time socket connection
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('subscribe-sensor', (cropId) => {
        socket.join(`crop-${cropId}`);
    });
});

// Export io untuk digunakan di controller
app.set('io', io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));