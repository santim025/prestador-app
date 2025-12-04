-- Create users_capital table (tracks each user's capital)
CREATE TABLE IF NOT EXISTS users_capital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_capital DECIMAL(15, 2) NOT NULL DEFAULT 0,
  initial_capital DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table (lenders' clients who borrow money)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  payage_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loans table (individual loans given to clients)
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL, -- percentage (e.g., 5.5 for 5.5%)
  start_date DATE NOT NULL,
  payment_frequency_days INTEGER NOT NULL DEFAULT 30, -- how often payment is due (days)
  status TEXT NOT NULL DEFAULT 'active', -- active, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table (track monthly/periodic payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_month DATE NOT NULL, -- YYYY-MM-01 format for consistency
  interest_earned DECIMAL(15, 2) NOT NULL,
  was_paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE users_capital ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_capital
CREATE POLICY "Users can view their own capital" ON users_capital 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own capital" ON users_capital 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own capital" ON users_capital 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients" ON clients 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON clients 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON clients 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON clients 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans" ON loans 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own loans" ON loans 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loans" ON loans 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loans" ON loans 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON payments 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_month ON payments(payment_month);
