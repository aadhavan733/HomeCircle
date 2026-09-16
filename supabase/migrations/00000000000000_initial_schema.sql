-- Stage 4: Database Schema and RLS Policies for HomeCircle

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom types
CREATE TYPE family_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE transaction_type AS ENUM ('expense', 'income');
CREATE TYPE transaction_visibility AS ENUM ('shared', 'personal');

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
-- Allow public viewing of profiles for family members? Simplest is to allow anyone authenticated to view basic profiles, or restrict to family members. For now, authenticated can view (to allow invites to work).
CREATE POLICY "Authenticated users can view other profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');


-- 2. FAMILIES
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- 3. FAMILY MEMBERS
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role family_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(family_id, user_id)
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Families Policies: Users can view their own family
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_members WHERE family_id = families.id AND user_id = auth.uid())
  );

-- Family Members Policies: Users can view members of their own family
CREATE POLICY "Users can view members of their family" ON family_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid())
  );
-- Only owner/admin can insert/update/delete family members
CREATE POLICY "Admins can manage family members" ON family_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid() AND fm.role IN ('owner', 'admin'))
  );


-- 4. CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view categories" ON categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_members WHERE family_id = categories.family_id AND user_id = auth.uid())
  );
-- For now, all members except viewers can manage categories
CREATE POLICY "Members can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_members WHERE family_id = categories.family_id AND user_id = auth.uid() AND role != 'viewer')
  );


-- 5. TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  type transaction_type NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  visibility transaction_visibility NOT NULL DEFAULT 'shared',
  note TEXT,
  is_synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transaction Policies
-- Shared: Any family member can view
CREATE POLICY "Family members can view shared transactions" ON transactions
  FOR SELECT USING (
    visibility = 'shared' AND 
    EXISTS (SELECT 1 FROM family_members WHERE family_id = transactions.family_id AND user_id = auth.uid())
  );
-- Personal: Only creator (and perhaps owners/admins, but MVP says explicitly authorized. Let's restrict strictly to creator for personal)
CREATE POLICY "Users can view their own personal transactions" ON transactions
  FOR SELECT USING (
    visibility = 'personal' AND user_id = auth.uid()
  );
-- Inserts: Members can insert their own transactions
CREATE POLICY "Members can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM family_members WHERE family_id = transactions.family_id AND user_id = auth.uid() AND role != 'viewer')
  );
-- Updates/Deletes: Users can manage their own, Admins can manage shared
CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage any shared transactions" ON transactions
  FOR UPDATE USING (
    visibility = 'shared' AND
    EXISTS (SELECT 1 FROM family_members WHERE family_id = transactions.family_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );
CREATE POLICY "Admins can delete any shared transactions" ON transactions
  FOR DELETE USING (
    visibility = 'shared' AND
    EXISTS (SELECT 1 FROM family_members WHERE family_id = transactions.family_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );


-- Trigger to automatically create profile for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

