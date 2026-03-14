import { Navbar } from "@/components/layout/Navbar";
import StudentClient from "@/app/(dashboard)/student/StudentClient";

export default function StudentDashboardPage() {
  return (
    <>
      <Navbar />
      <StudentClient />
    </>
  );
}
