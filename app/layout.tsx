import "./globals.css";
import Providers from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Employee Claims System - ECS",
  description: "Employee Dashboard for Claims and User Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground flex flex-col overflow-scroll">
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
