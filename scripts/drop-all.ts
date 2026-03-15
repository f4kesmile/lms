import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Dropping all user tables and enums...");

  const tables = [
    "Faq", "ChatTurn", "ChatSession", "MaterialChunk", "CourseMaterial",
    "ActivityCompletion", "CourseActivity", "CourseSection", "Course",
    "ClassStudent", "ClassSubject", "SubjectTeacher", "Class", "Subject",
    "AcademicYear", "User", "_prisma_migrations",
  ];

  for (const table of tables) {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`  Dropped table: ${table}`);
  }

  // CockroachDB does not support DROP TYPE CASCADE, so drop individually after tables are gone
  const enums = ["UserRole", "CourseStatus", "CourseActivityType", "CompletionState"];
  for (const enumName of enums) {
    try {
      await client.query(`DROP TYPE IF EXISTS "${enumName}"`);
      console.log(`  Dropped enum: ${enumName}`);
    } catch (err: unknown) {
      // May already not exist or may be referenced – log and continue
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
