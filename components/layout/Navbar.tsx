import { NavbarClient } from "@/components/layout/NavbarClient";
import { getCurrentUser } from "@/lib/auth/user";

type UserData = {
  name: string;
  role: string;
  avatarBase64?: string | null;
} | null;

export async function Navbar() {
  const currentUser = await getCurrentUser();

  const initialUser: UserData = currentUser
    ? {
        name: currentUser.name,
        role: currentUser.role,
        avatarBase64: currentUser.avatarBase64,
      }
    : null;

  return <NavbarClient initialUser={initialUser} />;
}
