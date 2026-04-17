import "dotenv/config";

import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Dropping all user tables and enums...");

  const tables = [
    "SystemLog", "Faq", "ChatTurn", "ChatSession",
    "MaterialChunk", "MeetingChunk", "CourseMaterial", "SubjectMeeting",
    "Course", "ClassStudent", "ClassSubject", "SubjectTeacher",
    "ChatbotSetting", "Class", "Subject", "AcademicYear", "User",
    "_prisma_migrations",
  ];

  for (const table of tables) {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`  Dropped table: ${table}`);
  }

  // PostgreSQL supports DROP TYPE CASCADE
  const enums = ["UserRole", "CourseStatus", "DayOfWeek"];
  for (const enumName of enums) {
    try {
      await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
      console.log(`  Dropped enum: ${enumName}`);
    } catch (err: unknown) {
      console.warn(`  Skipped enum ${enumName}:`, (err as Error).message);
    }
  }

  console.log("✅ All tables and enums dropped.");
  await client.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
