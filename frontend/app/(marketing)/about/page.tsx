import Navbar from "../../components/homepage/navbar";
import About from "../../components/homepage/Aboutus";
import Footer from "../../components/homepage/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Navbar */}
      <Navbar />

      {/* About Us Content */}
      <About />

      {/* Footer */}
      <Footer />
    </main>
  );
}