-- Insert sample locations
INSERT INTO locations (id, name, address, geofence_radius, lat, lng) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Main Office', '123 Business St, City, State 12345', 50, 40.7128, -74.0060),
    ('550e8400-e29b-41d4-a716-446655440002', 'Warehouse', '456 Industrial Ave, City, State 12345', 100, 40.7589, -73.9851);

-- Insert sample users
INSERT INTO users (id, name, email, role, location_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'John Manager', 'john.manager@company.com', 'manager', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Alice Employee', 'alice.employee@company.com', 'employee', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Bob Worker', 'bob.worker@company.com', 'employee', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Sarah Admin', 'sarah.admin@company.com', 'admin', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample clock events
INSERT INTO clock_events (user_id, clock_type, timestamp, method) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'in', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'manual'),
    ('550e8400-e29b-41d4-a716-446655440012', 'in', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes', 'geo'),
    ('550e8400-e29b-41d4-a716-446655440011', 'break_start', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'manual');
