import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "@/app/globals.css";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
      <div className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-[#004477] text-white min-h-screen p-5">
              <nav className="flex flex-col gap-4">
                <Link href="/superadmin" className="p-2 hover:bg-[#005599] rounded">View all Claims</Link>
                <Link href="/superadmin/categories" className="p-2 hover:bg-[#005599] rounded">View Categories</Link>
                <Link href="/superadmin/add-admin" className="p-2 hover:bg-[#005599] rounded">Add Admin</Link>
                <Link href="/superadmin/add-employee" className="p-2 hover:bg-[#005599] rounded">Add Employee</Link>
                {/* <Link href="/superadmin/logout" className="p-2 hover:bg-red-600 rounded">Logout</Link> */}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-10">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </div>
   
  );
}
