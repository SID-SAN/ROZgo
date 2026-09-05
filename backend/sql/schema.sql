-- ==============================================================================
-- ROZgo Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKER PROFILES TABLE
CREATE TABLE IF NOT EXISTS worker_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    labour_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar TEXT,
    location VARCHAR(100) NOT NULL,
    service_area VARCHAR(100) DEFAULT 'Within 10 km',
    primary_skill VARCHAR(50) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience_years INT DEFAULT 0,
    daily_rate NUMERIC(10, 2) DEFAULT 500,
    hourly_rate NUMERIC(10, 2) DEFAULT 80,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    verification_status VARCHAR(30) DEFAULT 'pending',
    bio TEXT,
    work_locations JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    portfolio JSONB DEFAULT '[]'::jsonb,
    availability JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    work_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMPLOYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS employer_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    avatar TEXT,
    employer_type VARCHAR(30) DEFAULT 'individual',
    business_name VARCHAR(150),
    business_type VARCHAR(100),
    employee_count VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    bio TEXT,
    hiring_preferences JSONB DEFAULT '{}'::jsonb,
    verification_details JSONB DEFAULT '{}'::jsonb,
    work_locations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_key VARCHAR(100) NOT NULL,
    default_name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    short_desc_key VARCHAR(100) NOT NULL,
    default_short_desc TEXT NOT NULL,
    subcategories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    employer_id VARCHAR(50) REFERENCES employer_profiles(id) ON DELETE CASCADE,
    worker_id VARCHAR(50) REFERENCES worker_profiles(id) ON DELETE SET NULL,
    service_id VARCHAR(50),
    subcategory_id VARCHAR(50),
    job_title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    duration_days INT DEFAULT 1,
    wage_offer NUMERIC(10, 2) NOT NULL,
    wage_type VARCHAR(20) DEFAULT 'daily',
    status VARCHAR(30) DEFAULT 'requested' CHECK (status IN ('requested', 'matched', 'agreement_pending', 'active', 'completed', 'cancelled')),
    agreement_confirmed_by_employer BOOLEAN DEFAULT FALSE,
    agreement_confirmed_by_worker BOOLEAN DEFAULT FALSE,
    special_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    worker_id VARCHAR(50) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(20) NOT NULL CHECK (author_role IN ('employer', 'worker')),
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    job_title VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VERIFICATION APPLICATIONS (KYC & DOCUMENTS)
CREATE TABLE IF NOT EXISTS verification_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(50) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    worker_name VARCHAR(100) NOT NULL,
    worker_phone VARCHAR(20) NOT NULL,
    method VARCHAR(30) NOT NULL CHECK (method IN ('aadhaar', 'eshram', 'other_id')),
    id_type VARCHAR(50),
    masked_identifier VARCHAR(50) NOT NULL,
    front_document_url TEXT,
    back_document_url TEXT,
    selfie_url TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'photo_resubmit_needed')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(100),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_worker_profiles_primary_skill ON worker_profiles(primary_skill);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_location ON worker_profiles(location);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON worker_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_employer_id ON bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON reviews(worker_id);

-- ==============================================================================
-- SEED DATA: CORE SERVICES
-- ==============================================================================
INSERT INTO service_categories (id, name_key, default_name, icon_name, short_desc_key, default_short_desc, subcategories)
VALUES
('plumber', 'services.plumber', 'Plumber', 'Wrench', 'services.plumberDesc', 'Pipe repair, leakage, tap fixes & sanitary works', 
 '[{"id":"tap_repair","nameKey":"services.tapRepair","defaultName":"Tap Repair & Fitting"},{"id":"pipe_leakage","nameKey":"services.pipeLeakage","defaultName":"Pipe Leakage & Joint Fix"},{"id":"drain_cleaning","nameKey":"services.drainCleaning","defaultName":"Drain Blockage & Cleaning"},{"id":"bathroom_plumbing","nameKey":"services.bathroomPlumbing","defaultName":"Complete Bathroom Plumbing"},{"id":"tank_install","nameKey":"services.tankInstall","defaultName":"Water Tank & Motor Installation"},{"id":"other_plumbing","nameKey":"services.other","defaultName":"Other Plumbing Work"}]'::jsonb),
('electrician', 'services.electrician', 'Electrician', 'Zap', 'services.electricianDesc', 'Wiring, switches, fuse & home circuit repairs',
 '[{"id":"switchboard_repair","nameKey":"services.switchboard","defaultName":"Switchboard & Socket Repair"},{"id":"fan_install","nameKey":"services.fanInstall","defaultName":"Ceiling Fan Install & Repair"},{"id":"mcb_fuse","nameKey":"services.mcbFuse","defaultName":"MCB Tripping & Short Circuit"},{"id":"light_fitting","nameKey":"services.lightFitting","defaultName":"LED & Decorative Lighting"},{"id":"inverter_setup","nameKey":"services.inverter","defaultName":"Inverter & Battery Wiring"},{"id":"other_electrical","nameKey":"services.other","defaultName":"Other Electrical Work"}]'::jsonb),
('carpenter', 'services.carpenter', 'Carpenter', 'Hammer', 'services.carpenterDesc', 'Furniture repair, door locks, hinges & custom woodwork',
 '[{"id":"furniture_repair","nameKey":"services.furniture","defaultName":"Furniture Repair & Assembly"},{"id":"door_lock","nameKey":"services.doorLock","defaultName":"Door Lock, Latch & Hinges"},{"id":"wardrobe_repair","nameKey":"services.wardrobe","defaultName":"Cupboard & Wardrobe Fixes"},{"id":"window_mesh","nameKey":"services.windowMesh","defaultName":"Window Mesh & Wooden Frames"},{"id":"other_carpentry","nameKey":"services.other","defaultName":"Other Carpentry Work"}]'::jsonb),
('domestic_help', 'services.domesticHelp', 'Domestic Help', 'Home', 'services.domesticHelpDesc', 'House cleaning, dusting, utensil washing & deep cleaning',
 '[{"id":"daily_cleaning","nameKey":"services.dailyCleaning","defaultName":"Daily Home Cleaning"},{"id":"deep_cleaning","nameKey":"services.deepCleaning","defaultName":"Deep Kitchen & Bathroom Clean"},{"id":"utensil_washing","nameKey":"services.utensils","defaultName":"Utensil Cleaning & Mopping"},{"id":"elderly_care","nameKey":"services.elderlyCare","defaultName":"Elderly & Patient Assistance"},{"id":"other_help","nameKey":"services.other","defaultName":"Other Domestic Work"}]'::jsonb),
('mason', 'services.mason', 'Mason & Construction', 'HardHat', 'services.masonDesc', 'Brickwork, plastering, tile fixing, flooring & masonry',
 '[{"id":"tile_laying","nameKey":"services.tileLaying","defaultName":"Floor & Wall Tile Laying"},{"id":"plaster_repair","nameKey":"services.plaster","defaultName":"Wall Plastering & Crack Repair"},{"id":"brickwork","nameKey":"services.brickwork","defaultName":"Brickwork & Partition Wall"},{"id":"concrete_repair","nameKey":"services.concrete","defaultName":"Concrete Slab & Lintels"},{"id":"other_mason","nameKey":"services.other","defaultName":"Other Masonry Work"}]'::jsonb),
('painter', 'services.painter', 'Painter', 'PaintBucket', 'services.painterDesc', 'Interior & exterior wall painting, waterproof coating & putty',
 '[{"id":"interior_painting","nameKey":"services.interiorPaint","defaultName":"Interior Wall Painting"},{"id":"exterior_painting","nameKey":"services.exteriorPaint","defaultName":"Exterior Weatherproof Coat"},{"id":"putty_primer","nameKey":"services.puttyPrimer","defaultName":"Wall Putty & Primer Base"},{"id":"waterproofing","nameKey":"services.waterproofing","defaultName":"Roof & Wall Waterproofing"},{"id":"other_painter","nameKey":"services.other","defaultName":"Other Painting Work"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Run in Supabase Storage Dashboard or via SQL)
-- ==============================================================================
-- Insert buckets into Supabase storage.buckets if using Supabase SQL
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('worker-documents', 'worker-documents', false),
  ('public-media', 'public-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to public-media bucket
CREATE POLICY "Public media access" ON storage.objects
FOR SELECT USING (bucket_id = 'public-media');

