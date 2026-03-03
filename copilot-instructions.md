# Copilot Instructions - Teacher Substitution Management System

## Project Overview

Teacher Substitution Management System is a Node.js + PostgreSQL application that automatically assigns substitute teachers when teachers are absent, using a fair workload distribution algorithm. The system has **two user roles**: Incharge (admin) and Staff (view-only with attendance marking).

**Tech Stack**: Express.js (backend), vanilla JavaScript (frontend), PostgreSQL (database), JWT (authentication)

## Critical Architecture Patterns

### 1. Database Layer (`config/database.js`)
- Uses **pg** library with connection pooling
- All queries use **parameterized statements** (e.g., `$1, $2`) to prevent SQL injection
- Connections automatically tested at server startup
- No manual connection/disconnection—pool handles lifecycle

### 2. Request Flow Pattern
```
HTTP Request → Express Routes → Auth Middleware (JWT check) → 
Authorization Middleware (role check if needed) → Controller → 
Database Query → Response JSON → Frontend DOM Update
```

### 3. Authentication & Authorization
- JWT tokens stored in `Authorization: Bearer <token>` header
- Middleware: `authenticateToken` (all protected routes) and `requireIncharge` (admin-only routes)
- Roles: `incharge` (full access) and `staff` (read + attendance marking only)
- Apply middleware in routes: `router.post('/assign', authenticateToken, requireIncharge, assignSubstitutions)`

### 4. Controller Organization
Each controller file (`controllers/*.js`) handles one domain:
- **authController**: Register, login (generates JWT)
- **teacherController**: CRUD operations, max substitution limits
- **substitutionController**: The core algorithm
- **attendanceController**: Mark present/absent
- **Others**: Dashboard, timetables, notifications

Controllers always:
- Use async/await with try-catch
- Return JSON responses with status codes
- Start transactions with `pool.query('BEGIN')` for multi-step operations

## Substitution Algorithm Details

**Most critical business logic** in `controllers/substitutionController.js`:

1. Identify absent teachers (marked as 'Absent' in attendance table, OR not marked as 'Present')
2. For each absent teacher, find their scheduled periods (from timetables table)
3. For each period, find substitute candidates who are:
   - Marked as 'Present' in attendance
   - Have a **free period** (not scheduled in timetables for that day/period)
   - Haven't exceeded their `max_substitution_limit`
4. **Select with lowest substitution count** (fairness mechanism)
5. Create substitution record + notification + increment their count

Example: If teacher A is absent Period 1-3 and teachers B (0 subs), C (1 sub), D (0 subs) are free:
- Period 1 → B (lower count)
- Period 2 → D (B now has 1 sub)
- Period 3 → C (already at 1)

**Key Query Pattern** (see `assignSubstitutions` function):
```javascript
WHERE te.id NOT IN (
    SELECT teacher_id FROM timetables
    WHERE day = $3 AND period_number = $4
) -- Free period check
AND (SELECT COUNT(*) FROM substitutions 
     WHERE substitute_teacher_id = te.id AND date = $1
) < te.max_substitution_limit -- Limit check
ORDER BY current_sub_count ASC, te.current_substitution_count ASC
```

## Frontend Conventions

### File Organization
- `public/js/api.js`: Centralized API helper with methods like `apiCall(method, endpoint, data)`
- `public/js/auth.js`: Login/signup logic + JWT token storage (localStorage)
- Page-specific files: `public/js/teachers.js`, `public/js/substitutions.js`, etc.

### Frontend Patterns
- **Token Management**: Stored in `localStorage` as `'authToken'`, read in every API call
- **Authorization in Frontend**: Check `localStorage.getItem('userRole')` to show/hide UI elements (e.g., hide "Add Teacher" button for Staff)
- **Fetch Pattern**: All API calls go through `api.js` helper for consistent headers:
  ```javascript
  const response = await apiCall('POST', '/api/teachers', {name, subject, ...});
  ```
- **DOM Updates**: Vanilla JS—fetch data, manipulate DOM directly (no framework)

### Common Frontend Tasks
- **Mark Attendance**: POST to `/api/attendance/mark` with date and status for each teacher
- **Assign Substitutions**: POST to `/api/substitutions/assign` with date and day
- **Notifications**: Check unread notifications on page load from `/api/notifications`

## Database Schema Quick Reference

**Key Tables**:
- `users`: (id, username, email, password_hash, role)
- `teachers`: (id, name, subject, max_substitution_limit, current_substitution_count)
- `timetables`: (id, teacher_id, day, period_number, class_name, subject)
- `attendance`: (id, teacher_id, date, status='Present'|'Absent')
- `substitutions`: (id, absent_teacher_id, substitute_teacher_id, date, status, period_number, day)
- `notifications`: (id, user_id, teacher_id, substitution_id, message, read_status)

**Critical Indexes**: On `date`, `teacher_id`, `period_number`, `day` for substitution queries

## Common Development Workflows

### Setup & Running
```bash
npm install                                    # Install dependencies
psql -U postgres -d teacher_substitution -f database/schema.sql  # Create schema
npm run setup                                  # Create default users (admin/password123, staff1/password123)
npm run dev                                    # Start with auto-reload (nodemon)
```

### Testing Substitution Assignment
Use `/testSubstitutions.js` for manual testing:
```bash
node testSubstitutions.js
```

### Debugging Database Issues
Check `.env` file (PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET)
Connect directly: `psql -U postgres -d teacher_substitution`

### Adding a New Feature
1. Create/update database schema if needed
2. Create controller method in appropriate file
3. Add route in `routes/*.js`
4. Add frontend HTML/JS in `public/`
5. Follow existing response format: `{ message: '...', data: {...} }` or `{ error: '...' }`

## Project-Specific Conventions

- **Date Format**: YYYY-MM-DD (e.g., '2024-01-15')
- **Day Names**: 'Monday', 'Tuesday', etc. (capitalized)
- **Period Numbers**: 1-8 typically
- **Status Values**: 'Present', 'Absent' (for attendance), 'assigned', 'completed' (for substitutions)
- **Error Handling**: Return `{ error: 'message' }` with appropriate HTTP status code (400, 401, 403, 500)
- **Success Response**: `{ message: '...', data: {...} }` or just `{ substitutions: [...] }`

## Integration Points & External Dependencies

- **PostgreSQL**: Must be running; test connection at server startup via `SELECT NOW()`
- **JWT Secret**: Required in `.env`, used for token generation/verification
- **CORS**: Enabled for all origins (consider restricting in production)
- **bcryptjs**: Used in `authController.js` for password hashing and verification

## Important Files to Know

- [server.js](server.js) - Entry point, route setup
- [controllers/substitutionController.js](controllers/substitutionController.js) - Core business logic
- [middleware/auth.js](middleware/auth.js) - JWT and role-based access control
- [database/schema.sql](database/schema.sql) - Table definitions and constraints
- [public/js/api.js](public/js/api.js) - API communication helper
- [SUBSTITUTION_LOGIC.md](SUBSTITUTION_LOGIC.md) - Detailed algorithm explanation

## Testing & Validation

- **Unit Testing**: None currently—focus on integration testing
- **Manual Testing**: Use browser console to test API calls
- **Database Validation**: Use `testSubstitutions.js` or manual queries in psql
- **Common Issues**: 
  - "No substitute available" → Check timetables and attendance data
  - "Token expired" → Check JWT_SECRET matches and token isn't stale
  - Database errors → Verify schema is created and all tables exist
