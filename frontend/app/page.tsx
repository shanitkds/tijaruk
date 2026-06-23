// @ts-nocheck
import About from "../components/home/About";
import Benefits from "../components/home/Benefits";
import Contact from "../components/home/Contact";
import Footer from "../components/shares/Footer";
import Hero from "../components/home/Hero";
import Services from "../components/home/Services";
import Testimonials from "../components/home/Testimonials";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[#fbfafa] text-[#161616]">
      <Hero />
      <About />
      <Services />
      <Benefits />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}

