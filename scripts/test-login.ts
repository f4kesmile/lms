import { prisma } from "../lib/core/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "budi@lms.com";
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log("User not found in DB");
    return;
  }
  
  console.log("User details:", { id: user.id, email: user.email, hasPassword: !!user.password });
  
  const isMatch = await bcrypt.compare("password123", user.password);
  console.log("Bcrypt compare result for 'password123':", isMatch);
}

main().finally(() => prisma.$disconnect());
