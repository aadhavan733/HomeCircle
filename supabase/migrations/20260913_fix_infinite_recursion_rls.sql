-- ====================================================================
-- HomeCircle: Comprehensive RLS Infinite Recursion & Permission Fix
-- ====================================================================

-- 0. GRANT BASIC TABLE PERMISSIONS (Fixes "permission denied" errors)
-- When creating tables via SQL, sometimes the default Supabase grants are missing.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_bills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_occurrences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_contributions TO authenticated;

-- 1. DROP ALL EXISTING POLICIES ON family_members TO CLEAR OUT CONFLICTS
-- Dropping the original names:
DROP POLICY IF EXISTS "Users can view members of their family" ON public.family_members;
DROP POLICY IF EXISTS "Admins can manage family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can insert themselves into family_members" ON public.family_members;
DROP POLICY IF EXISTS "Users can remove themselves or admins can manage members" ON public.family_members;
-- Dropping the new names from the previous run to ensure this script can be run multiple times safely:
DROP POLICY IF EXISTS "Users can view family_members" ON public.family_members;
DROP POLICY IF EXISTS "Users and admins can insert family_members" ON public.family_members;
DROP POLICY IF EXISTS "Admins can update family_members" ON public.family_members;
DROP POLICY IF EXISTS "Users can leave or admins can remove family_members" ON public.family_members;

-- 2. RECREATE FAMILY MEMBERS POLICIES WITHOUT RECURSION

-- SELECT: Allow any authenticated user to view family_members. 
-- This completely avoids recursion because it doesn't query family_members.
CREATE POLICY "Users can view family_members" ON public.family_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: Users can add themselves, or admins can add others
CREATE POLICY "Users and admins can insert family_members" ON public.family_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role IN ('owner', 'admin')
    )
  );

-- UPDATE: Only admins/owners can update roles
CREATE POLICY "Admins can update family_members" ON public.family_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role IN ('owner', 'admin')
    )
  );

-- DELETE: Users can remove themselves, admins can remove others
CREATE POLICY "Users can leave or admins can remove family_members" ON public.family_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_members fm 
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role IN ('owner', 'admin')
    )
  );


-- 3. FIX FAMILIES TABLE
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;
CREATE POLICY "Users can view families they belong to" ON public.families
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.family_members WHERE family_id = families.id AND user_id = auth.uid())
  );
