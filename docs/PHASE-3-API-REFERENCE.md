# Phase 3: API Reference 📡

Lengkap API endpoints dan documentation untuk Nusa Belajar.

---

## 1. Quick Reference

### Base URL

```
Development:  http://localhost:3000
Production:   https://yourdomain.com
```

### Authentication

Semua API endpoints (kecuali `/api/auth/login` dan `/api/auth/register`) memerlukan authentication:

```
Header:
Cookie: jwt=<token>

atau

Authorization: Bearer <token>
```

### Response Format

Success Response (200):

```json
{
  "status": "success",
  "data": {
    /* entity data */
  }
}
```

Error Response (4xx/5xx):

```json
{
  "status": "error",
  "message": "Error description here"
}
```

---

## 2. Authentication Endpoints

### POST /api/auth/register

**Register user baru dengan email & password**

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@student.kampus.ac.id",
  "password": "SecurePassword123!",
  "role": "mahasiswa"
}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Full name |
| email | string | Yes | Email unique |
| password | string | Yes | Min 8 chars |
| role | enum | No | "mahasiswa", "dosen", "admin" (default: mahasiswa) |

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@student.kampus.ac.id",
    "role": "mahasiswa",
    "isActive": true,
    "createdAt": "2026-03-31T10:00:00Z"
  }
}
```

**Errors:**

- `400`: Email already exists / Domain not allowed / Invalid input
- `409`: User with this email already registered

**Domain Validation Rules:**

- If `AUTH_EMAIL_MODE=restricted`: Email domain must in `AUTH_ALLOWED_EMAIL_DOMAINS`
- If `AUTH_EMAIL_MODE=public`: No domain validation

---

### POST /api/auth/login

**Login dengan email & password**

**Request:**

```json
{
  "email": "john@student.kampus.ac.id",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@student.kampus.ac.id",
    "role": "mahasiswa",
    "redirectUrl": "/courses"
  }
}
```

**Cookie Set:**

```
Set-Cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000
```

**Errors:**

- `400`: Invalid credentials
- `401`: User not active

---

### GET /api/auth/google/callback

**Google OAuth callback**

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| code | Authorization code from Google |
| state | CSRF token |

**Flow:**

1. Exchange code → access token
2. Fetch user profile
3. Check if user exists
4. Create if doesn't exist + check domain restriction
5. Set JWT cookie
6. Redirect ke dashboard

**Response (302 Redirect):**

```
Location: /courses or /admin (based on role)
```

**Errors:**

- `401`: Invalid code / state mismatch
- `403`: Domain not allowed

---

### GET /api/auth/microsoft/callback

**Microsoft OAuth callback**

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| code | Authorization code from Microsoft |
| state | CSRF token |

Same flow as Google.

---

### POST /api/auth/logout

**Logout user**

**Request:**

```json
{}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Cookie Cleared:**

```
Set-Cookie: jwt=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/
```

---

## 3. Courses Endpoints

### GET /api/courses

**Dapatkan semua courses (published)**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | published | "published", "draft", "archived" |
| skip | number | 0 | Pagination offset |
| take | number | 10 | Pagination limit |

**Request:**

```
GET /api/courses?status=published&skip=0&take=10
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "code": "CS101",
      "title": "Introduction to Computer Science",
      "description": "Learn...",
      "learningOutcomes": "After this course...",
      "status": "published",
      "createdAt": "2026-03-30T10:00:00Z",
      "createdBy": {
        "id": "uuid",
        "name": "Dr. Smith",
        "email": "smith@kampus.ac.id"
      }
    }
  ],
  "meta": {
    "total": 25,
    "skip": 0,
    "take": 10
  }
}
```

**Access:** All authenticated users

---

### GET /api/courses/[courseId]

**Dapatkan detail course spesifik**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| courseId | string (UUID) | Course ID |

**Request:**

```
GET /api/courses/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "CS101",
    "title": "Introduction to Computer Science",
    "description": "...",
    "learningOutcomes": "...",
    "status": "published",
    "createdAt": "2026-03-30T10:00:00Z",
    "createdBy": {
      "id": "uuid",
      "name": "Dr. Smith"
    },
    "materials": [
      {
        "id": "uuid",
        "title": "Chapter 1: Basics",
        "module": "1",
        "content": "<p>HTML content</p>"
      }
    ]
  }
}
```

**Errors:**

- `404`: Course not found

---

### GET /api/courses/[courseId]/materials

**Dapatkan materials dari course**

**Request:**

```
GET /api/courses/550e8400-e29b-41d4-a716-446655440000/materials
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "title": "Chapter 1",
      "module": "1",
      "page": "5-10",
      "content": "<h1>Chapter 1</h1>...",
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

### POST /api/courses (Create)

**Buat course baru**

**Requires:** Admin atau Dosen

**Request:**

```json
{
  "code": "CS102",
  "title": "Data Structures",
  "description": "Learn about...",
  "learningOutcomes": "Students will...",
  "status": "draft"
}
```

**Request Body Schema:**

```typescript
interface CreateCourseRequest {
  code: string; // Unique, min 2 chars
  title: string; // Min 5 chars
  description?: string;
  learningOutcomes?: string;
  status?: "draft" | "published" | "archived";
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "new-uuid",
    "code": "CS102",
    "title": "Data Structures",
    "description": "...",
    "learningOutcomes": "...",
    "status": "draft",
    "createdById": "current-user-id",
    "createdAt": "2026-03-31T10:00:00Z"
  }
}
```

**Errors:**

- `401`: Not authenticated
- `403`: Not authorized (requires admin/dosen)
- `400`: Invalid input / Code already exists

---

### PATCH /api/courses/[courseId]

**Update course**

**Requires:** Admin atau Original Creator (dosen)

**Request:**

```json
{
  "title": "Data Structures - Advanced",
  "status": "published"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    /* updated course */
  }
}
```

---

### DELETE /api/courses/[courseId]

**Delete course**

**Requires:** Admin

**Response (200):**

```json
{
  "status": "success",
  "message": "Course deleted"
}
```

---

## 4. Subjects Endpoints

### GET /api/subjects

**Dapatkan semua subjects**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| isActive | boolean | true | Filter by active status |
| skip | number | 0 | Pagination |
| take | number | 10 | Pagination |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Algoritma & Struktur Data",
      "code": "CS201",
      "credits": 3,
      "description": "...",
      "learningOutcomes": "...",
      "isActive": true,
      "status": "published",
      "bannerImage": "https://...",
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

### GET /api/subjects/[subjectId]

**Dapatkan subject detail**

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Algoritma & Struktur Data",
    "code": "CS201",
    "credits": 3,
    "description": "...",
    "learningOutcomes": "...",
    "bannerImage": "...",
    "isActive": true,
    "status": "published",
    "meetings": [
      {
        "id": "uuid",
        "meetingNo": 1,
        "title": "Introduction to Algorithms",
        "content": "...",
        "createdAt": "2026-03-30T10:00:00Z"
      }
    ],
    "teachers": [
      {
        "userId": "uuid",
        "name": "Dr. Smith",
        "email": "smith@..."
      }
    ]
  }
}
```

---

### POST /api/subjects (Create)

**Buat subject baru**

**Requires:** Admin

**Request:**

```json
{
  "name": "Database Management",
  "code": "CS301",
  "credits": 3,
  "description": "Learn about databases...",
  "learningOutcomes": "Students will...",
  "status": "draft"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    /* created subject */
  }
}
```

---

## 5. Classes Endpoints

### GET /api/classes

**Dapatkan semua classes**

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| academicYearId | string | Filter by academic year |
| skip | number | Pagination |
| take | number | Pagination |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "A1",
      "academicYearId": "uuid",
      "capacity": 40,
      "enrollmentKey": "ENROLL-KEY-123",
      "studentCount": 35,
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

### GET /api/classes/[classId]

**Dapatkan class detail dengan students & subjects**

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "A1",
    "academicYearId": "uuid",
    "capacity": 40,
    "enrollmentKey": "...",
    "students": [
      {
        "userId": "uuid",
        "name": "Student Name",
        "email": "student@...",
        "progress": 65
      }
    ],
    "subjects": [
      {
        "classId": "uuid",
        "subjectId": "uuid",
        "subjectName": "Algoritma",
        "teacherName": "Dr. Smith",
        "dayOfWeek": "MONDAY",
        "startTime": "08:00",
        "endTime": "10:00",
        "room": "Lab 1"
      }
    ]
  }
}
```

---

### POST /api/classes (Create)

**Buat class baru**

**Requires:** Admin

**Request:**

```json
{
  "name": "B2",
  "academicYearId": "uuid",
  "capacity": 40
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    /* created class with enrollment key */
  }
}
```

---

### POST /api/classes/[classId]/enroll

**Enroll student ke class**

**Requires:** Mahasiswa + valid enrollment key

**Request:**

```json
{
  "enrollmentKey": "ENROLL-KEY-123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Successfully enrolled to class A1"
}
```

**Errors:**

- `400`: Invalid enrollment key
- `409`: Already enrolled
- `403`: Class full

---

## 6. Academic Years Endpoints

### GET /api/academic-years

**Dapatkan semua academic years**

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "2025/2026",
      "fromYear": "2025-08-01T00:00:00Z",
      "toYear": "2026-07-31T23:59:59Z",
      "isCurrent": true,
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

### GET /api/academic-years/current

**Dapatkan current academic year**

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "2025/2026",
    "fromYear": "2025-08-01T00:00:00Z",
    "toYear": "2026-07-31T23:59:59Z",
    "isCurrent": true
  }
}
```

---

### POST /api/academic-years (Create)

**Buat academic year**

**Requires:** Admin

**Request:**

```json
{
  "name": "2026/2027",
  "fromYear": "2026-08-01",
  "toYear": "2027-07-31",
  "isCurrent": false
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    /* created academic year */
  }
}
```

---

## 7. Users Endpoints

### GET /api/users/me

**Dapatkan profile user current (authenticated)**

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@student.kampus.ac.id",
    "role": "mahasiswa",
    "isActive": true,
    "nip": null,
    "specialization": null,
    "createdAt": "2026-03-30T10:00:00Z"
  }
}
```

---

### GET /api/users

**Dapatkan semua users**

**Requires:** Admin

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role |
| isActive | boolean | Filter by active status |
| skip | number | Pagination |
| take | number | Pagination |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@student.kampus.ac.id",
      "role": "mahasiswa",
      "isActive": true,
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "skip": 0,
    "take": 10
  }
}
```

---

### GET /api/users/[userId]

**Dapatkan user detail**

**Requires:** Self atau Admin

**Response (200):**

```json
{
  "status": "success",
  "data": {
    /* user detail */
  }
}
```

---

### PATCH /api/users/[userId]

**Update user profile**

**Requires:** Self atau Admin

**Request:**

```json
{
  "name": "Jane Doe",
  "specialization": "Backend Development"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    /* updated user */
  }
}
```

---

### PATCH /api/users/[userId]/role

**Change user role**

**Requires:** Admin

**Request:**

```json
{
  "role": "dosen"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    /* user with new role */
  }
}
```

---

### PATCH /api/users/[userId]/toggle-active

**Activate/deactivate user**

**Requires:** Admin

**Request:**

```json
{
  "isActive": false
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "User deactivated"
}
```

---

## 8. Chat Endpoints

### GET /api/chat/sessions

**Dapatkan semua chat sessions user**

**Requires:** Authenticated

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Homework Help - Algorithm",
      "createdAt": "2026-03-31T10:00:00Z",
      "updatedAt": "2026-03-31T14:30:00Z"
    }
  ]
}
```

---

### POST /api/chat/sessions

**Buat chat session baru**

**Request:**

```json
{
  "title": "Questions about Algorithms"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "new-uuid",
    "userId": "current-user-id",
    "title": "Questions about Algorithms",
    "createdAt": "2026-03-31T10:00:00Z"
  }
}
```

---

### GET /api/chat/sessions/[sessionId]/history

**Dapatkan chat history dari session**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sessionId | string (UUID) | Session ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | number | 0 | Pagination |
| take | number | 50 | Messages limit |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "role": "user",
      "content": "How to sort an array?",
      "createdAt": "2026-03-31T10:00:00Z"
    },
    {
      "id": "uuid",
      "sessionId": "uuid",
      "role": "assistant",
      "content": "There are several ways to sort an array...",
      "createdAt": "2026-03-31T10:00:10Z"
    }
  ]
}
```

---

### POST /api/chat/send

**Send message ke chat session**

**Requires:** Authenticated

**Request:**

```json
{
  "sessionId": "uuid",
  "message": "How does binary search work?",
  "type": "user"
}
```

**Response:**

```
Streaming Response (chunked):
[message object]
[message object]
...
```

Untuk streaming, gunakan EventSource atau fetch dengan streaming response.

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "userMessage": {
      "id": "uuid",
      "role": "user",
      "content": "How does binary search work?"
    },
    "aiResponse": {
      "id": "uuid",
      "role": "assistant",
      "content": "Binary search is an efficient algorithm..."
    }
  }
}
```

---

## 9. Knowledge Base Endpoints

### GET /api/kb

**Search knowledge base**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query |
| type | string | No | "material" or "meeting" |
| skip | number | No | Pagination |
| take | number | No | Limit (default: 5) |

**Request:**

```
GET /api/kb?query=algorithm&type=material&take=10
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "type": "material",
      "title": "Chapter 1: Introduction to Algorithms",
      "source": "CS101",
      "excerpt": "Algorithms are step-by-step procedures...",
      "relevanceScore": 0.92
    }
  ]
}
```

---

## 10. FAQs Endpoints

### GET /api/faqs

**Dapatkan semua FAQs**

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| search | string | Search in Q&A |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "category": "enrollment",
      "question": "How do I enroll in a course?",
      "answer": "To enroll, go to courses page...",
      "views": 234,
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

## 11. Admin Endpoints

### GET /api/admin/logs

**Dapatkan system logs**

**Requires:** Admin

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| level | string | info | "error", "warning", "info", "debug" |
| skip | number | 0 | Pagination |
| take | number | 100 | Limit |
| fromDate | string | - | ISO date filter |
| toDate | string | - | ISO date filter |

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "level": "ERROR",
      "message": "Database connection failed",
      "meta": { "error": "..." },
      "createdAt": "2026-03-31T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5234,
    "skip": 0
  }
}
```

---

### DELETE /api/admin/logs

**Clear old logs**

**Requires:** Admin

**Request:**

```json
{
  "beforeDate": "2026-02-01T00:00:00Z"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Deleted 1,234 log records"
}
```

---

## 12. Error Codes Reference

| Code | Status            | Description                               |
| ---- | ----------------- | ----------------------------------------- |
| 200  | OK                | Request successful                        |
| 201  | Created           | Resource created                          |
| 204  | No Content        | No content in response                    |
| 400  | Bad Request       | Invalid input / validation error          |
| 401  | Unauthorized      | Not authenticated / expired token         |
| 403  | Forbidden         | Not authorized / insufficient permissions |
| 404  | Not Found         | Resource not found                        |
| 409  | Conflict          | Resource conflict (e.g., duplicate)       |
| 422  | Unprocessable     | Validation failed                         |
| 429  | Too Many Requests | Rate limit exceeded                       |
| 500  | Server Error      | Internal server error                     |
| 503  | Unavailable       | Service temporarily unavailable           |

---

## 13. Rate Limiting

Endpoints dilindungi dengan rate limiting:

```
Default: 100 requests per 15 minutes per IP
Auth endpoints: 5 requests per 15 minutes per IP
```

**Response when limited (429):**

```json
{
  "status": "error",
  "message": "Too many requests. Try again later."
}
```

**Headers returned:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704325200
```

---

## 14. Pagination

Endpoints yang mengembalikan list menggunakan pagination:

**Query Parameters:**

```
skip=0    // Offset (default: 0)
take=10   // Limit (default: 10, max: 100)
```

**Response Meta:**

```json
{
  "meta": {
    "total": 250,
    "skip": 0,
    "take": 10,
    "hasMore": true,
    "pageCount": 25
  }
}
```

---

## 15. Example: Complete Flow

### Scenario: Mahasiswa enroll course dan chat with AI

```
1. Login
   POST /api/auth/login
   → Get JWT token in cookie

2. Browse Courses
   GET /api/courses?status=published
   → List of published courses

3. View Course Detail
   GET /api/courses/{courseId}
   → See materials, learning outcomes

4. Enroll Course
   (Server Action - lib/actions/course.ts)
   enrollCourse(courseId)
   → Create ClassStudent record

5. Create Chat Session
   POST /api/chat/sessions
   → Create new session for Q&A

6. Send Message to Chatbot
   POST /api/chat/send
   {
     "sessionId": "session-uuid",
     "message": "What's the difference between list and tuple?",
     "type": "user"
   }
   → AI retrieves relevant materials
   → Generates answer with context
   → Returns response

7. View Chat History
   GET /api/chat/sessions/{sessionId}/history
   → All messages in conversation
```

---

## 📝 Tips

1. **Always include authentication** - JWT token must be valid and not expired
2. **Validate input** - Server validates dengan Zod, follow schema rules
3. **Check response status** - More reliable than HTTP status code
4. **Handle errors gracefully** - Always show error message to user
5. **Use pagination** - For list endpoints, implement infinite scroll or pagination
6. **Rate limiting** - Implement retry logic dengan exponential backoff

---

**Next:** Lanjut ke [Phase 4 - Features Documentation](PHASE-4-FEATURES.md) untuk detail implementasi features.
