# Phase 5: Development Guide 👨‍💻

Panduan lengkap untuk development workflow dan menambahkan fitur baru.

---

## 1. Development Workflow

### Daily Development Cycle

```
┌─────────────────────────────────────────┐
│ 1. START OF DAY                         │
├─────────────────────────────────────────┤
│ npm run dev                             │
│ → Dev server running on localhost:3000 │
│ → Watch for file changes                │
│ → Automatic hot reload                 │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 2. WORK ON FEATURE                      │
├─────────────────────────────────────────┤
│ a. Pick feature from backlog            │
│ b. Create feature branch                │
│    git checkout -b feature/new-feature  │
│ c. Make code changes                    │
│    - Follow code conventions             │
│    - Write tests (optional)             │
│ d. Test locally in browser               │
│ e. Commit regularly                     │
│    git commit -m "feat: add..."         │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 3. BEFORE PUSH                          │
├─────────────────────────────────────────┤
│ npm run lint                            │
│ → Check for code style issues           │
│ → Fix warnings/errors                   │
│                                         │
│ npm run build                           │
│ → Build for production                  │
│ → Check for build errors                │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 4. PUSH & MERGE                         │
├─────────────────────────────────────────┤
│ git push origin feature/new-feature     │
│ → Create Pull Request                   │
│ → Await code review                     │
│ → Merge to main                         │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 5. DEPLOYMENT                           │
├─────────────────────────────────────────┤
│ → Deploy to production                  │
│ → Monitor logs                          │
└─────────────────────────────────────────┘
```

### Essential Commands

```bash
# Start development
npm run dev                    # Start dev server

# Build for production
npm run build                  # Create optimized build
npm run start                  # Run production build

# Code quality
npm run lint                   # Run ESLint
npm run lint -- --fix         # Auto-fix linting issues

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Create new migration
npx prisma studio            # Open DB visualizer

# Cleanup
npm run clean                 # Remove build artifacts
```

---

## 2. Adding a New Feature - Step by Step

### Example: Add "Favorite Courses" Feature

#### Step 1: Plan the Feature

```
Requirements:
- Mahasiswa dapat mark courses as favorite
- Favorite courses tampil di dedicated page
- Show favorite count di course card
- Database: Add CourseFavorite model
- API: POST/DELETE /api/courses/{id}/favorite
- UI: Heart icon pada course card
```

#### Step 2: Add Database Model

Edit `prisma/schema.prisma`:

```prisma
model CourseFavorite {
  userId    String
  courseId  String
  createdAt DateTime @default(now())

  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@id([userId, courseId])
  @@index([userId])
}

// Update User model:
model User {
  // ... existing fields
  favorited  CourseFavorite[]
}

// Update Course model:
model Course {
  // ... existing fields
  favoritedBy CourseFavorite[]
}
```

#### Step 3: Migrate Database

```bash
npm run prisma:migrate -- --name add_course_favorites
```

Verify migration file created di `prisma/migrations/`.

#### Step 4: Create Server Actions

Create `lib/actions/course.ts` (atau update existing):

```typescript
"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/core/db";
import { revalidatePath } from "next/cache";

export async function toggleCourseFavorite(courseId: string) {
  const user = await requireRole("mahasiswa", "dosen", "admin");

  // Check if already favorited
  const existing = await db.courseFavorite.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (existing) {
    // Remove from favorites
    await db.courseFavorite.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });
  } else {
    // Add to favorites
    await db.courseFavorite.create({
      data: {
        userId: user.id,
        courseId,
      },
    });
  }

  revalidatePath("/courses");
  revalidatePath("/courses/favorites");
}

export async function getFavoriteCourses(userId: string) {
  const courses = await db.courseFavorite.findMany({
    where: { userId },
    include: {
      course: {
        include: { createdBy: true },
      },
    },
  });

  return courses.map((fav) => fav.course);
}
```

#### Step 5: Create API Route (Optional)

```typescript
// app/api/courses/[courseId]/favorite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleCourseFavorite } from "@/lib/actions/course";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  try {
    await toggleCourseFavorite(params.courseId);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 400 },
    );
  }
}
```

#### Step 6: Create UI Component

```typescript
// components/features/courses/FavoriteButton.tsx
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleCourseFavorite } from "@/lib/actions/course";
import { toast } from "sonner";

interface FavoriteButtonProps {
  courseId: string;
  isFavorited: boolean;
}

export function FavoriteButton({
  courseId,
  isFavorited: initialFavorited
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleFavorite() {
    setIsLoading(true);
    try {
      await toggleCourseFavorite(courseId);
      setIsFavorited(!isFavorited);
      toast.success(
        isFavorited
          ? "Removed from favorites"
          : "Added to favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-lg transition ${
        isFavorited
          ? "bg-red-100 text-red-600"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <Heart
        size={24}
        fill={isFavorited ? "currentColor" : "none"}
      />
    </button>
  );
}
```

#### Step 7: Update Course Card

```typescript
// app/(public)/courses/_components/CourseCard.tsx
import { FavoriteButton } from "@/components/features/courses";

interface CourseCardProps {
  course: any;
  isFavorited: boolean;
}

export function CourseCard({ course, isFavorited }: CourseCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.code}</p>
        </div>
        <FavoriteButton courseId={course.id} isFavorited={isFavorited} />
      </div>

      <p className="text-sm text-gray-700 mb-3">
        {course.description}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {course.createdBy?.name}
        </span>
        <Link
          href={`/courses/${course.id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
```

#### Step 8: Create New Page (Optional)

```typescript
// app/(public)/courses/favorites/page.tsx
import { getCurrentUser } from "@/lib/auth/user";
import { getFavoriteCourses } from "@/lib/actions/course";
import { CourseCard } from "../_components/CourseCard";
import { EmptyState } from "@/components/shared";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const courses = await getFavoriteCourses(user.id);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorite Courses</h1>

      {courses.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Start by favoriting courses that interest you"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 9: Test Feature

```bash
# Start dev server
npm run dev

# Manual testing:
1. Login as mahasiswa
2. Go to /courses
3. Click heart icon on course
4. Verify heart fills
5. Go to /courses/favorites
6. Verify course appears
```

#### Step 10: Submit PR

```bash
git add .
git commit -m "feat: add course favorites functionality"
git push origin feature/course-favorites

# Create Pull Request on GitHub
# → Describe changes
# → Reference any issues
# → Request review
```

---

## 3. Code Organization Best Practices

### Project Structure for New Feature

```
Feature: "Course Reviews"

Structure:
lib/actions/
  └── review.ts              # Server actions (DB side-effects)

lib/services/
  └── review.ts              # Business logic (queries, calculations)

app/(public)/courses/[courseId]/
  ├── _components/
  │   ├── ReviewList.tsx     # Display reviews
  │   ├── ReviewForm.tsx     # Add/edit review
  │   └── ReviewStats.tsx    # Rating stats
  └── _lib/
      └── fetch-reviews.ts   # Local data fetching

components/features/courses/
  └── ReviewCard.tsx         # Reusable review component

api/
  └── courses/[courseId]/
      └── reviews/
          └── route.ts       # API endpoints
```

### File Naming Convention

```
✓ GOOD:
  - components/AdminLayout.tsx
  - lib/actions/course.ts
  - lib/services/auth.ts
  - app/(admin)/admin/page.tsx
  - app/api/courses/route.ts

✗ BAD:
  - components/adminlayout.tsx
  - lib/course-actions.ts
  - adminLayout.ts (in wrong folder)
  - app/adminpanel/page.tsx
  - api.ts (too generic)
```

### Type Safety

```typescript
// ✓ GOOD - Use interfaces untuk type safety
interface Course {
  id: string;
  title: string;
  status: CourseStatus;
}

async function getCourse(id: string): Promise<Course> {
  // ...
}

// ✗ BAD - Using any
async function getCourse(id: any): Promise<any> {
  // ...
}

// ✓ GOOD - Use Zod untuk runtime validation
const CreateCourseSchema = z.object({
  title: z.string().min(5),
  code: z.string().min(2),
  status: z.enum(["draft", "published", "archived"]),
});

type CreateCourseRequest = z.infer<typeof CreateCourseSchema>;

// ✗ BAD - No validation
function handleCreate(data) {
  // data could be anything
}
```

---

## 4. Database Migrations

### Working with Prisma Migrations

```bash
# 1. Make schema changes in prisma/schema.prisma
# 2. Generate migration
npm run prisma:migrate -- --name descriptive_name

# 3. Verify migration file di prisma/migrations/
# 4. Apply to database
npm run prisma:migrate

# 5. Prisma client otomatis generate
npx prisma generate

# 6. Commit migration file
git add prisma/migrations/
git commit -m "db: add feature_name table"
```

### Common Migrations

```prisma
// Add new field
model User {
  // ... existing
  phoneNumber: String?
}

// Create junction table
model CourseEnrollment {
  userId   String
  courseId String
  enrolledAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@id([userId, courseId])
}

// Add unique constraint
model Email {
  id    String @id @unique
  value String @unique
}

// Add index for performance
model Log {
  id        String @id
  level     String
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

### Rolling Back Migration

```bash
# If migration not yet deployed to prod:
# Simply delete the migration folder

rm -rf prisma/migrations/[timestamp]_[name]
git add .
git commit -m "revert: remove migration"

# If already deployed:
# Create new migration to revert changes

npm run prisma:migrate -- --name revert_feature_name
# Then edit the generated migration file
```

---

## 5. Testing

### Manual Testing Checklist

Sebelum submit PR, test:

```
Feature: Course Enrollment
- [ ] Mahasiswa can enroll course
- [ ] Cannot enroll twice
- [ ] Cannot enroll when full
- [ ] Cannot enroll dengan invalid key
- [ ] Enrolled course appears in view
- [ ] Logs recorded properly
- [ ] UI feedback (success toast)
- [ ] Mobile responsive
```

### Testing Different Roles

```bash
# Login dengan different roles:
1. Admin account
2. Dosen account
3. Mahasiswa account

Test:
- Access control (should not see unauthorized pages)
- Role-specific features
- Different UI layouts
```

### Browser DevTools Testing

```
1. Open DevTools (F12)
2. Console tab: Check untuk error messages
3. Network tab:
   - API requests successful?
   - Response times acceptable?
   - No 404/500 errors?
4. Performance tab:
   - Lighthouse audit
   - Check performance score
5. Application tab:
   - Verify JWT cookie set
   - Check localStorage
```

---

## 6. Performance Optimization

### Common Performance Issues

```typescript
// ❌ BAD - N+1 query problem
const courses = await db.course.findMany();
for (const course of courses) {
  const teacher = await db.user.findUnique({
    where: { id: course.createdById },
  });
  // ... use teacher
}
// This does N queries (1 for courses + N for each teacher)

// ✓ GOOD - Use include untuk single query
const courses = await db.course.findMany({
  include: { createdBy: true },
});
// Single query with JOIN
```

```typescript
// ❌ BAD - Unnecessary re-renders
export function CourseList() {
  const [courses, setCourses] = useState([]);

  // This runs every render!
  useEffect(() => {
    fetch("/api/courses").then((data) => setCourses(data));
  }); // Missing dependency array
}

// ✓ GOOD - Proper dependency
export function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses").then((data) => setCourses(data));
  }, []); // Runs only once
}
```

```typescript
// ❌ BAD - Inefficient rendering
export function UserList({ users }) {
  return (
    <div>
      {users.map((user, index) => (
        <UserCard key={index} user={user} /> // Bad key!
      ))}
    </div>
  );
}

// ✓ GOOD - Use stable ID as key
export function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Image Optimization

```typescript
// ✓ Use Next.js Image component
import Image from "next/image";

export function CourseCard({ course }) {
  return (
    <div>
      <Image
        src={course.bannerImage}
        alt={course.title}
        width={300}
        height={200}
        quality={75}
        placeholder="blur"
        blurDataURL={blurredImageBlurhash}
      />
    </div>
  );
}
```

---

## 7. Debugging Tips

### Server-side Debug

```typescript
// Use console.log (visible in terminal)
console.log("Current user:", user);

// Use next/headers untuk debug request
import { headers } from "next/headers";
const headerList = await headers();
console.log("Request headers:", headerList);

// Use Prisma logging
// .env: DATABASE_URL="..?log=query,info,warn,error"
```

### Client-side Debug

```typescript
// Browser console
console.log("Course data:", course);
console.error("Error:", error);

// React DevTools
// Install extension: React Developer Tools

// Network debugging
// Chrome DevTools → Network tab
// Check API response bodies

// Performance profiling
// Chrome DevTools → Performance tab
// Record and analyze slow interactions
```

---

## 8. Deployment Checklist

Sebelum deploy ke production:

```
Code Quality:
- [ ] npm run lint passes
- [ ] npm run build succeeds
- [ ] No console warnings/errors
- [ ] Code reviewed

Database:
- [ ] Migrations up to date
- [ ] No unresolved migrations
- [ ] Backup database created

Environment:
- [ ] Environment variables set
- [ ] JWT_SECRET configured (production value)
- [ ] DATABASE_URL correct
- [ ] File permissions correct

Testing:
- [ ] Feature tested manually
- [ ] Different roles tested
- [ ] Edge cases handled
- [ ] Error handling working

Documentation:
- [ ] API changes documented
- [ ] Schema changes documented
- [ ] New endpoints in API reference
- [ ] Deployment notes added
```

---

## 9. Common Development Issues & Solutions

### Issue: Hot reload not working

```bash
# Solution: Restart dev server
npm run dev  # Ctrl+C, then npm run dev again
```

### Issue: Prisma client out of sync

```bash
# Solution: Regenerate Prisma client
npm run prisma:generate
```

### Issue: TypeScript errors

```bash
# Solution: Update TypeScript cache
rm -rf .next node_modules/.cache
npm run build
```

### Issue: Database migration conflict

```bash
# Solution: Check migration status
npx prisma migrate status

# Then resolve conflicts manually
npm run prisma:migrate -- --name fix_conflict
```

---

## 10. Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Next:** Baca [Phase 6 - Troubleshooting & Reference](PHASE-6-REFERENCE.md) untuk common issues dan environment reference.
