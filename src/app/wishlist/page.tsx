import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WishlistContent from "./WishlistContent";

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Navbar />
      <WishlistContent />
      <Footer />
    </div>
  );
}

