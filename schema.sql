-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tanaman / Crop master
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest DATE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Sensor data (IoT)
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    soil_moisture DECIMAL(5,2),
    light_intensity INTEGER,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Harvest / hasil
CREATE TABLE harvests (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id),
    quantity_kg DECIMAL(10,2),
    harvest_date DATE,
    notes TEXT
);

-- Notifications queue
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50), -- email, whatsapp
    recipient VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);