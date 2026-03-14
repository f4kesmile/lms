import { Navbar } from "@/components/layout/Navbar";
import LoginClient from "@/app/(auth)/login/LoginClient";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <LoginClient />
    </>
  );
}
