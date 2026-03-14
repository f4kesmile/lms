import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import HelpClient from "@/app/(public)/help/HelpClient";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <HelpClient />
      <Footer />
    </>
  );
}
