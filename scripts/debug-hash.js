const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'budi@lms.com' } });
    console.log("DB USER FOUND:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Hashed Pw Length:", user.password.length);
    console.log("Hashed Pw Prefix:", user.password.substring(0, 10));
    
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log("Bcrypt Match (password123) =>", isMatch);
  } catch(e) {
    console.log(e);
  }
}

main().finally(() => process.exit(0));
