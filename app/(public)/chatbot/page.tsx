import { Navbar } from "@/components/layout/Navbar";
import ChatbotClient from "@/app/(public)/chatbot/ChatbotClient";

export default function ChatbotPage() {
  return (
    <>
      <Navbar />
      <ChatbotClient />
    </>
  );
}
