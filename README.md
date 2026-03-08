# Flying Club Frontend - Vue 3 (v2.0 - RBAC Edition)

Modern Vue 3 + TypeScript + Vite frontend with **Role-Based Access Control** for the Flying Club API.

## 🆕 What's New in v2.0

- ✅ **Role-Based Access Control (RBAC)** - Admin, Operator, and Member roles
- ✅ **Permission-Based UI** - Features show/hide based on user role
- ✅ **HTTPS Support** - Works with secured backend
- ✅ **Enhanced Authentication** - Role information included in user profile
- ✅ **Improved Security** - All endpoints now require authentication

## User Roles & Permissions

### 👑 Admin
**Full access to everything:**
- ✅ Manage members (CRUD)
- ✅ Manage aircraft (CRUD)
- ✅ Manage all reservations
- ✅ View all flight logs
- ✅ Manage all billing

### 🔧 Operator
**Operational management:**
- ✅ Manage aircraft (CRUD)
- ✅ Manage all reservations
- ✅ View all flight logs
- ✅ Manage billing
- ❌ Cannot manage members

### 👤 Member
**Personal access only:**
- ✅ View own reservations
- ✅ Create own reservations
- ✅ View own flight logs
- ✅ View own billing
- ❌ Cannot manage aircraft
- ❌ Cannot see other members' data
- ❌ Cannot manage billing

## Features

- **Smart Dashboard** - Shows different stats based on role
- **Dynamic Navigation** - Menu items appear/disappear based on permissions
- **Access Control** - Automatic redirection if unauthorized
- **Role Badges** - Visual indication of user role throughout UI
- **Filtered Data** - Members see only their own data, Admins/Operators see all

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Type-safe development with role types
- **Vite** - Lightning-fast dev server
- **Vue Router** - Client-side routing with role guards
- **Pinia** - State management with permission helpers
- **Axios** - HTTP client with auth interceptors

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update API URL:**
   
   Edit `src/services/api.ts` (line 14):
   ```typescript
   const API_URL = 'https://your-railway-app.up.railway.app/api'
   ```
   
   **Note:** Your backend now supports HTTPS! Make sure to use `https://` in production.

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   
   Open `http://localhost:5173`

## Test Users

Based on your updated sample data, you should have users with different roles:

### Admin User:
```
Email: admin@example.com
Password: password123
Role: admin
```

### Operator User:
```
Email: operator@example.com
Password: password123
Role: operator
```

### Member User:
```
Email: member@example.com
Password: password123
Role: member
```

*Note: Check your `db/sample-data.sql` for actual test credentials*

## Role-Based UI Examples

### Dashboard
**Admin/Operator sees:**
- Total Members stat
- All Reservations
- All Flight Logs
- Billing management

**Member sees:**
- Only "My Reservations"
- Only "My Flights"
- Personal stats only

### Aircraft Page
**Admin/Operator:**
- Full CRUD operations
- Add/Edit/Delete aircraft

**Member:**
- Access Denied message
- Cannot view this page

### Reservations
**Admin/Operator:**
- See all member reservations
- Member column visible in table

**Member:**
- See only their own reservations
- No member column (redundant)

## Permission Helpers (Pinia Store)

The auth store provides convenient permission checks:

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Role checks
authStore.isAdmin      // true if admin
authStore.isOperator   // true if operator
authStore.isMember     // true if member

// Permission checks
authStore.canManageMembers       // Only admins
authStore.canManageAircraft      // Admins + Operators
authStore.canManageReservations  // Admins + Operators
authStore.canManageBilling       // Admins + Operators
</script>
```

## UI Components with RBAC

### Conditional Rendering
```vue
<button v-if="authStore.canManageAircraft" @click="addAircraft">
  Add Aircraft
</button>
```

### Access Denied Messages
```vue
<div v-if="!authStore.canManageMembers" class="alert alert-error">
  Access Denied: Admin only
</div>
```

### Dynamic Stats
```vue
<div class="stat-card">
  <h3>{{ authStore.isAdmin ? 'All' : 'My' }} Reservations</h3>
  <div class="value">{{ reservationCount }}</div>
</div>
```

## API Changes from v1.0

### Authentication Response
Now includes role:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"  // ← NEW!
  }
}
```

### Member Model
Added role field:
```typescript
interface Member {
  // ... other fields
  role: 'admin' | 'operator' | 'member'  // ← NEW!
}
```

## Security Features

1. **All endpoints require authentication** - No public access
2. **JWT tokens** - Secure, stateless authentication
3. **Role-based permissions** - Backend enforces access control
4. **Frontend guards** - Prevents unauthorized UI access
5. **HTTPS support** - Encrypted communication

## Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

## Deployment

### Vercel
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Add environment variables in Vercel dashboard
4. Update CORS in backend to include Vercel URL

### Backend CORS Configuration

Your backend needs to allow your frontend URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',              // Development
    'https://your-frontend.vercel.app'    // Production
  ],
  credentials: true
}))
```

## Troubleshooting

### "Access Denied" on every page
- Check that your user has the correct role in the database
- Verify JWT token includes role information
- Check browser console for API errors

### Can't see any data
- Members can only see their own data
- Make sure reservations/flights are linked to your user ID
- Admins/Operators should see all data

### Login works but role features don't appear
- Clear browser localStorage and re-login
- Check that backend API returns role in profile endpoint
- Verify Pinia store is loading user data correctly

## Development vs Production

### Development (localhost:5173)
- Hot reload enabled
- Detailed error messages
- CORS from localhost

### Production (Vercel/Netlify)
- Optimized build
- Minified code
- HTTPS required
- CORS from production domain

## Migration from v1.0

If you're updating from the previous version:

1. **Update types** - Member interface now has `role` field
2. **Update API calls** - Profile response includes role
3. **Update UI** - Add role-based conditional rendering
4. **Test permissions** - Verify each role works correctly
5. **Update backend CORS** - Include new frontend URL

## Code Structure

```
src/
├── views/              # Page components with RBAC
│   ├── Dashboard.vue   # Role-based stats & actions
│   ├── Aircraft.vue    # Admin/Operator only
│   ├── Reservations.vue # Filtered by role
│   ├── FlightLogs.vue  # Filtered by role
│   └── Billing.vue     # Admin/Operator only
├── stores/
│   └── auth.ts         # ← Role & permission logic
├── types/
│   └── index.ts        # ← Role type definitions
└── services/
    └── api.ts          # HTTP client
```

## Future Enhancements

- [ ] Member management page (Admin only)
- [ ] Role assignment UI (Admin only)
- [ ] Audit logs (who did what)
- [ ] Email notifications based on role
- [ ] Advanced filtering by role
- [ ] Permission matrix documentation
- [ ] Role-based dashboard widgets

## License

MIT

---

**Built with ❤️ using Vue 3 + RBAC**

*Secure, scalable, and role-aware!*
