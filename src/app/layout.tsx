import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SyncProvider from "@/components/SyncProvider";
import FamilySwitcher from "@/components/FamilySwitcher";
import GlobalFab from "@/components/GlobalFab";
import { createClient } from "@/utils/supabase/server";
import { getActiveFamilyId } from "@/lib/activeFamily";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeCircle",
  description: "Know your family's money. Plan your month. Save together.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to load the current user's family info for the switcher
  let familySwitcherProps: {
    families: { id: string; name: string; role: string }[]
    activeFamilyId: string
    activeFamilyName: string
  } | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { familyId, familyName, allFamilies } = await getActiveFamilyId(user.id)
      if (familyId && familyName) {
        familySwitcherProps = {
          families: allFamilies,
          activeFamilyId: familyId,
          activeFamilyName: familyName,
        }
      }
    }
  } catch {
    // Not logged in or error — switcher simply won't render
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased md:flex md:h-screen md:overflow-hidden`}>
        <SyncProvider>
          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-5xl mx-auto pb-24 md:pb-0 md:h-screen md:overflow-y-auto">
            {/* Mobile top bar with family switcher */}
            {familySwitcherProps && (
              <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-1">
                  <img src="/logo_icon.png" alt="Logo" className="h-9 w-auto object-contain" />
                  <span className="text-xl font-bold text-blue-600 tracking-tight leading-none mt-1">HomeCircle</span>
                </div>
                <div className="flex items-center gap-3">
                  <FamilySwitcher {...familySwitcherProps} />
                  <Link href="/family" className="text-gray-500 hover:text-blue-600 text-xl" aria-label="Family Settings">
                    ⚙️
                  </Link>
                </div>
              </div>
            )}
            {children}
          </main>

          {/* Floating Action Button */}
          <GlobalFab />

          {/* Bottom Navigation (Mobile) / Side Navigation (Desktop) */}
          <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:relative md:w-64 md:border-t-0 md:border-r md:flex md:flex-col md:p-4 z-40 md:order-first shadow-sm">
            <div className="md:hidden flex justify-between items-center h-16 px-4">
              <Link href="/" className="flex flex-col items-center text-[10px] font-semibold text-gray-500 hover:text-blue-600 w-12">
                <span className="text-xl mb-1">🏠</span> Home
              </Link>
              <Link href="/transactions" className="flex flex-col items-center text-[10px] font-semibold text-gray-500 hover:text-blue-600 w-12">
                <span className="text-xl mb-1">💸</span> Txns
              </Link>
              
              <div className="w-14" /> {/* Spacer for centered FAB */}
              
              <Link href="/bills" className="flex flex-col items-center text-[10px] font-semibold text-gray-500 hover:text-blue-600 w-12">
                <span className="text-xl mb-1">🧾</span> Bills
              </Link>
              <Link href="/goals" className="flex flex-col items-center text-[10px] font-semibold text-gray-500 hover:text-blue-600 w-12">
                <span className="text-xl mb-1">🎯</span> Goals
              </Link>
            </div>

            {/* Desktop Nav version */}
            <div className="hidden md:flex flex-col h-full">
              <div className="mb-6 p-2">
                <div className="flex items-center gap-1 mb-6">
                  <img src="/logo_icon.png" alt="Logo" className="h-12 w-auto object-contain" />
                  <span className="text-2xl font-bold text-blue-600 tracking-tight leading-none mt-1">HomeCircle</span>
                </div>
                {familySwitcherProps && (
                  <FamilySwitcher {...familySwitcherProps} />
                )}
              </div>
              <Link href="/" className="p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center font-medium transition-colors">
                <span className="mr-3 text-xl">🏠</span> Home
              </Link>
              <Link href="/transactions" className="p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center font-medium transition-colors">
                <span className="mr-3 text-xl">💸</span> Transactions
              </Link>
              <Link href="/bills" className="p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center font-medium transition-colors">
                <span className="mr-3 text-xl">🧾</span> Bills
              </Link>
              <Link href="/goals" className="p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center font-medium transition-colors">
                <span className="mr-3 text-xl">🎯</span> Goals
              </Link>
              <Link href="/family" className="p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center font-medium transition-colors">
                <span className="mr-3 text-xl">👨‍👩‍👧‍👦</span> Family
              </Link>
            </div>
          </nav>
        </SyncProvider>
      </body>
    </html>
  );
}
