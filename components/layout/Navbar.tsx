import { getCurrentUser } from "@/lib/auth/user";
import { NavbarClient } from "@/components/layout/NavbarClient";

type UserData = { name: string; role: string } | null;

export async function Navbar() {
  const currentUser = await getCurrentUser();

  const initialUser: UserData = currentUser
    ? { name: currentUser.name, role: currentUser.role }
    : null;

  return <NavbarClient initialUser={initialUser} />;
}
