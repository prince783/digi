import Navbar from "../../components/homepage/navbar";
import Contact from "../../components/homepage/contact";
import Footer from "../../components/homepage/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Navbar */}
      <Navbar />

      {/* Contact Us Content */}
      <Contact />

      {/* Footer */}
      <Footer />
    </main>
  );
}