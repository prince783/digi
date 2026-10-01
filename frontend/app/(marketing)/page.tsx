import Navbar from "../components/homepage/navbar";
import Hero from "../components/homepage/hero";
import Features from "../components/homepage/feature";
import HowItWorks from "../components/homepage/HowItWork";
import About from "../components/homepage/About";
import CTA from "../components/homepage/CTA";
import Footer from "../components/homepage/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <Hero />

      <Features />

      <HowItWorks />

      <About />

      <CTA />

      <Footer />
    </main>
  );
}