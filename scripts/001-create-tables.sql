-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('employee', 'manager', 'admin')) NOT NULL DEFAULT 'employee',
    location_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    geofence_radius INTEGER DEFAULT 100, -- meters
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ClockEvents table
CREATE TABLE IF NOT EXISTS clock_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_type VARCHAR(20) CHECK (clock_type IN ('in', 'out', 'break_start', 'break_end')) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(20) CHECK (method IN ('manual', 'qr', 'geo')) DEFAULT 'manual',
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    notes TEXT
);

-- Create Timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Add foreign key constraint for location_id in users table
ALTER TABLE users ADD CONSTRAINT fk_users_location 
    FOREIGN KEY (location_id) REFERENCES locations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clock_events_user_id ON clock_events(user_id);
CREATE INDEX IF NOT EXISTS idx_clock_events_timestamp ON clock_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
