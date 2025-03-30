import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col justify-between min-h-screen">
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  );
}