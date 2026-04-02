import HelpClient from "@/app/(public)/help/HelpClient";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <HelpClient />
      <Footer />
    </>
  );
}
