-- ====================================================================
-- HomeCircle: Family Creation RLS, Helper RPC, and Additional Tables
-- Run this in your Supabase SQL Editor to enable family creation,
-- budgets, recurring bills, and savings goals.
-- ====================================================================

-- 1. FAMILIES TABLE POLICIES (Fix: Allow authenticated users to create a family)
DROP POLICY IF EXISTS "Authenticated users can create families" ON families;
CREATE POLICY "Authenticated users can create families" ON families
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owners and admins can update family" ON families;
CREATE POLICY "Owners and admins can update family" ON families
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_id = families.id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- 2. FAMILY MEMBERS TABLE POLICIES (Fix: Allow users to add themselves as initial owner)
DROP POLICY IF EXISTS "Users can insert themselves into family_members" ON family_members;
CREATE POLICY "Users can insert themselves into family_members" ON family_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can remove themselves or admins can manage members" ON family_members;
CREATE POLICY "Users can remove themselves or admins can manage members" ON family_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM family_members fm 
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role IN ('owner', 'admin')
    )
  );

-- 3. ATOMIC STORED PROCEDURE: Create family with defaults in 1 step
CREATE OR REPLACE FUNCTION public.create_family_with_defaults(family_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_family_id UUID;
  curr_user_id UUID;
BEGIN
  curr_user_id := auth.uid();
  
  IF curr_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure profile exists in public.profiles to satisfy foreign key constraint
  INSERT INTO public.profiles (id, email, full_name)
  SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  FROM auth.users
  WHERE id = curr_user_id
  ON CONFLICT (id) DO NOTHING;

  -- 1. Insert new family
  INSERT INTO public.families (name)
  VALUES (family_name)
  RETURNING id INTO new_family_id;

  -- 2. Add creator as owner
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, curr_user_id, 'owner');

  -- 3. Add default categories
  INSERT INTO public.categories (family_id, name, type)
  VALUES 
    (new_family_id, 'Groceries', 'expense'),
    (new_family_id, 'Rent', 'expense'),
    (new_family_id, 'Transport', 'expense'),
    (new_family_id, 'Utilities', 'expense'),
    (new_family_id, 'Dining Out', 'expense'),
    (new_family_id, 'Salary', 'income'),
    (new_family_id, 'Other Income', 'income');

  RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_family_with_defaults(TEXT) TO authenticated;

-- ====================================================================
-- 4. BUDGETS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- e.g. '2026-09'
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(family_id, month_year, category_id)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view budgets" ON public.budgets;
CREATE POLICY "Family members can view budgets" ON public.budgets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = budgets.family_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Family members can manage budgets" ON public.budgets;
CREATE POLICY "Family members can manage budgets" ON public.budgets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = budgets.family_id AND user_id = auth.uid())
  );

-- ====================================================================
-- 5. RECURRING BILLS & OCCURRENCES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.recurring_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  frequency TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'weekly', 'yearly'
  next_due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view recurring bills" ON public.recurring_bills;
CREATE POLICY "Family members can view recurring bills" ON public.recurring_bills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = recurring_bills.family_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Family members can manage recurring bills" ON public.recurring_bills;
CREATE POLICY "Family members can manage recurring bills" ON public.recurring_bills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = recurring_bills.family_id AND user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.bill_occurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES public.recurring_bills(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.bill_occurrences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view bill occurrences" ON public.bill_occurrences;
CREATE POLICY "Family members can view bill occurrences" ON public.bill_occurrences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recurring_bills rb
      JOIN public.family_members fm ON fm.family_id = rb.family_id
      WHERE rb.id = bill_occurrences.bill_id AND fm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Family members can manage bill occurrences" ON public.bill_occurrences;
CREATE POLICY "Family members can manage bill occurrences" ON public.bill_occurrences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recurring_bills rb
      JOIN public.family_members fm ON fm.family_id = rb.family_id
      WHERE rb.id = bill_occurrences.bill_id AND fm.user_id = auth.uid()
    )
  );

-- ====================================================================
-- 6. SAVINGS GOALS & CONTRIBUTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount_paise INTEGER NOT NULL CHECK (target_amount_paise > 0),
  target_date DATE,
  visibility TEXT NOT NULL DEFAULT 'shared', -- 'shared', 'personal'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view relevant goals" ON public.savings_goals;
CREATE POLICY "Users can view relevant goals" ON public.savings_goals
  FOR SELECT USING (
    (visibility = 'shared' AND EXISTS (SELECT 1 FROM public.family_members WHERE family_id = savings_goals.family_id AND user_id = auth.uid()))
    OR
    (visibility = 'personal' AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Family members can manage their goals" ON public.savings_goals;
CREATE POLICY "Family members can manage their goals" ON public.savings_goals
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = savings_goals.family_id AND user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view contributions" ON public.goal_contributions;
CREATE POLICY "Family members can view contributions" ON public.goal_contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.savings_goals sg
      WHERE sg.id = goal_contributions.goal_id
      AND (
        (sg.visibility = 'shared' AND EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_id = sg.family_id AND fm.user_id = auth.uid()))
        OR
        (sg.visibility = 'personal' AND sg.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Family members can insert contributions" ON public.goal_contributions;
CREATE POLICY "Family members can insert contributions" ON public.goal_contributions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.savings_goals sg
      JOIN public.family_members fm ON fm.family_id = sg.family_id
      WHERE sg.id = goal_contributions.goal_id AND fm.user_id = auth.uid()
    )
  );
