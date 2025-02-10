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
          {/* <main className="flex min-h-screen"> */}
          <main className="flex min-h-screen max-w-[1600px] mx-auto">
            {/* Sidebar */}
            <aside className="w-60 bg-[#9BB1D2] text-white min-h-screen px-5">
            {/* <aside className="w-80 bg-[#004477] text-white min-h-screen p-5"> */}
              <nav className="flex flex-col gap-4">
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">View all Claims</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">View Categories</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">Add Admin</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">Add Employee</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">Add Category</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">View Admin</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">View Employee</Link>
                <Link href="/protected" className="p-2 bg-[#7398B7] hover:bg-[#005599] rounded">View Report</Link>
                
                {/* <Link href="/superadmin/logout" className="p-2 hover:bg-red-600 rounded">Logout</Link> */}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 px-5 bg-[#9BB1D2] max-w-6xl">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </div>
   
  );
}
