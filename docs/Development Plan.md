# MockMate V2 - Development Plan

**Project:** MockMate - Local Mock API Server for Mobile Developers
**Approach:** 3-Phase Development (MVP → HTTPS → Enhanced Features)
**Structure:** Monorepo with npm/yarn workspaces
**Timeline:** 4-5 weeks total

---

## Overview

MockMate is a local-first mock API server specifically designed for mobile developers (iOS/Android). It enables scenario-based testing where developers can instantly switch between different API states (empty, error, slow network, etc.) without code changes or manual data editing.

**Key Differentiator:** Scenario-based testing with one-click switching + HTTPS support for real device testing.

---

## Tech Stack

**Backend:**
- Runtime: Node.js 20+
- Language: TypeScript
- Server: Express.js
- WebSocket: ws (real-time logging)
- HTTPS: node-forge (certificate generation)

**Frontend:**
- Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- State: Zustand
- JSON Editor: Monaco Editor

**Storage:**
- JSON files in `~/.mockmate/`
- No database required

**Architecture:**
```
Projects → Resources → Scenarios → Response
```

---

## Phase 1: MVP - Simulator Support (2 weeks)

**Goal:** Build core functionality for HTTP mocking with web dashboard, targeting iOS/Android simulators.

### Sub-Phase 1.1: Backend Core & Storage (Days 1-3)

#### Day 1: Storage Layer Foundation (6-8 hours)

**Critical Files:**
- `packages/server/src/types.ts` - Core interfaces (Project, Resource, Scenario)
- `packages/server/src/services/storage.ts` - File system operations

**Tasks:**
1. Define TypeScript interfaces for Project, Resource, Scenario
2. Implement storage initialization (`~/.mockmate/` directory structure)
3. Create generic JSON file read/write utilities
4. Implement slug generation (project name → folder name)
5. Add error handling for file operations

**Testing:**
- Unit tests for slug generation
- Integration tests for file operations
- Test concurrent write handling

#### Day 2: Project Management Service (6-8 hours)

**Critical Files:**
- `packages/server/src/services/projects.ts` - Project CRUD operations

**Tasks:**
1. Implement `createProject(name, description?)` - Generate ID, create folder
2. Implement `listProjects()` - Read all projects from storage
3. Implement `getProject(id)`, `updateProject(id)`, `deleteProject(id)`
4. Implement `setActiveProject(id)` - Update global config
5. Add validation (unique names, ID existence checks)

**Testing:**
- Full CRUD lifecycle tests
- Duplicate name handling
- Cascading deletion of resources

#### Day 3: Resource & Scenario Management (6-8 hours)

**Critical Files:**
- `packages/server/src/services/resources.ts` - Resource CRUD
- `packages/server/src/services/scenarios.ts` - Scenario operations

**Tasks:**
1. Implement resource CRUD with path parameter support (`/api/users/:id`)
2. Auto-create "default" scenario on resource creation
3. Implement scenario add/update/delete/duplicate operations
4. Protect "default" scenario from deletion
5. Implement scenario fallback logic

**Testing:**
- Resource creation with default scenario
- Scenario CRUD operations
- Default scenario protection

### Sub-Phase 1.2: Mock Server & Request Matching (Days 4-5)

#### Day 4: Request Matching Engine (6-8 hours)

**Critical Files:**
- `packages/server/src/services/matcher.ts` - Request → Resource matching

**Tasks:**
1. Implement `pathToRegex(path)` - Convert `/api/users/:id` to regex
2. Implement `matchRequest(method, path, resources)` - Find matching resource
3. Extract path parameters from matched routes
4. Implement `resolveScenario(resource, activeScenario)` with fallback
5. Build response builder (status, headers, delay, body)

**Testing:**
- Exact path matching
- Path parameter matching (`/users/:id` matches `/users/123`)
- Method matching (GET vs POST)
- Scenario fallback logic

#### Day 5: Mock HTTP Server (6-8 hours)

**Critical Files:**
- `packages/server/src/app.ts` - Express application setup
- `packages/server/src/routes/mock.ts` - Catch-all mock handler

**Tasks:**
1. Configure Express with CORS middleware
2. Create catch-all route handler for all HTTP methods
3. Load active project and resources
4. Match incoming requests to resources
5. **Implement header-based scenario selection** (check for `X-MockMate-Scenario` header)
6. Apply scenario priority: header-specified → active scenario → default
7. Apply delay if configured
8. Return response with proper status/headers
9. Implement request logging (in-memory, max 100 entries)

**Testing:**
- Integration tests with real HTTP requests
- CORS headers verification
- Header-based scenario selection
- Delay simulation
- 404 handling for unmatched routes

### Sub-Phase 1.3: Admin API (Days 6-7)

#### Days 6-7: Admin Routes Implementation (12-16 hours)

**Critical Files:**
- `packages/server/src/routes/admin.ts` - Admin API endpoints

**Tasks:**
1. Create admin router on `/api/admin` prefix
2. **Project endpoints:** GET/POST/PUT/DELETE projects, PUT scenario switch
3. **Resource endpoints:** GET/POST/PUT/DELETE resources per project
4. **Scenario endpoints:** POST/PUT/DELETE/duplicate scenarios
5. **Server endpoints:** GET status, GET/DELETE logs
6. Add error handling middleware

**Endpoints:**
```
# Projects
GET    /api/admin/projects
POST   /api/admin/projects
GET    /api/admin/projects/:id
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
PUT    /api/admin/projects/:id/scenario (switch active)

# Resources
GET    /api/admin/projects/:projectId/resources
POST   /api/admin/projects/:projectId/resources
GET    /api/admin/projects/:projectId/resources/:resourceId
PUT    /api/admin/projects/:projectId/resources/:resourceId
DELETE /api/admin/projects/:projectId/resources/:resourceId

# Scenarios
POST   /api/admin/projects/:pid/resources/:rid/scenarios
PUT    /api/admin/projects/:pid/resources/:rid/scenarios/:name
DELETE /api/admin/projects/:pid/resources/:rid/scenarios/:name
POST   /api/admin/projects/:pid/resources/:rid/scenarios/:name/duplicate

# Server
GET    /api/admin/status
GET    /api/admin/logs
DELETE /api/admin/logs
```

**Testing:**
- Integration tests for all CRUD operations
- Validation (required fields, invalid IDs)
- Error responses (404, 400)

### Sub-Phase 1.4: WebSocket for Real-Time Logs (Day 8)

#### Day 8: WebSocket Server (4-6 hours)

**Critical Files:**
- `packages/server/src/services/websocket.ts` - WebSocket server

**Tasks:**
1. Initialize ws server alongside HTTP server
2. Handle client connections/disconnections
3. Broadcast log entries to all connected clients
4. Send last 100 entries on client connect
5. Integrate with request logger to emit events

**Message Format:**
```json
{
  "type": "log",
  "entry": {
    "timestamp": "2025-12-30T10:00:00Z",
    "method": "GET",
    "path": "/api/home/banners",
    "resourceId": "res_xxx",
    "scenario": "default",
    "statusCode": 200,
    "duration": 123
  }
}
```

**Testing:**
- Multiple client connections
- Reconnection handling
- Log buffer limit enforcement

### Sub-Phase 1.5: Frontend Dashboard (Days 9-14)

#### Day 9: Project Setup & Layout (6-8 hours)

**Critical Files:**
- `packages/dashboard/src/main.tsx` - React entry
- `packages/dashboard/src/App.tsx` - Root component
- `packages/dashboard/src/components/Layout.tsx` - Main layout
- `packages/dashboard/src/api/client.ts` - Typed API client

**Tasks:**
1. Initialize Vite + React + TypeScript project
2. Install and configure Tailwind CSS
3. Configure Vite proxy for API requests to backend
4. Create Layout, Header, Sidebar components
5. Create typed API client with fetch
6. Define interfaces matching backend types

#### Day 10: Project Management UI (6-8 hours)

**Critical Files:**
- `packages/dashboard/src/components/ProjectList.tsx`
- `packages/dashboard/src/components/ProjectModal.tsx`
- `packages/dashboard/src/hooks/useProjects.ts`

**Tasks:**
1. Display all projects in sidebar
2. Highlight active project
3. Create "New Project" modal with form
4. Implement project creation API call
5. Set up state management (Zustand or React Query)
6. Add project selection functionality

#### Day 11: Resource Management UI (6-8 hours)

**Critical Files:**
- `packages/dashboard/src/components/ResourceList.tsx`
- `packages/dashboard/src/components/ResourceEditor.tsx`
- `packages/dashboard/src/hooks/useResources.ts`

**Tasks:**
1. Display resources for selected project (method, path, scenario count)
2. Create "Add Resource" button and modal
3. Build resource editor form (method dropdown, path input)
4. Implement resource CRUD operations
5. Add optimistic UI updates

#### Day 12: Scenario Editor (6-8 hours)

**Critical Files:**
- `packages/dashboard/src/components/ScenarioEditor.tsx`
- `packages/dashboard/src/components/JsonEditor.tsx`

**Tasks:**
1. Create expandable accordion for each scenario
2. Add form fields: name, status code, delay, headers
3. Integrate Monaco Editor for JSON response body
4. Add JSON validation with error display
5. Implement scenario add/duplicate/delete (protect "default")

#### Day 13: Scenario Switcher & Request Log (8 hours)

**Critical Files:**
- `packages/dashboard/src/components/ScenarioSwitcher.tsx`
- `packages/dashboard/src/components/RequestLog.tsx`
- `packages/dashboard/src/hooks/useWebSocket.ts`

**Tasks:**
1. Create scenario switcher dropdown
2. List all unique scenario names across resources
3. Implement API call to switch active scenario
4. Build WebSocket connection hook with auto-reconnect
5. Display request log in reverse chronological order
6. Add auto-scroll to latest entry
7. Implement clear log button

#### Day 14: Polish & Integration (6-8 hours)

**Tasks:**
1. Add toast notifications for errors/success
2. Implement loading states for all API calls
3. Create empty states for no projects/resources
4. Polish styling (spacing, colors, responsive design)
5. Add hover states and transitions
6. **End-to-end testing:** Create project → add resource → add scenarios → switch → verify mock works

---

## Phase 2: HTTPS & Real Device Support (1 week)

**Goal:** Enable testing on physical iOS/Android devices over local network with HTTPS.

### Sub-Phase 2.1: Certificate Generation (Days 15-16)

#### Day 15: Certificate Service (6-8 hours)

**Critical Files:**
- `packages/server/src/services/certs/generator.ts`

**Tasks:**
1. Install and configure node-forge
2. Implement `generateCA()` - Create root CA certificate
3. Implement `generateServerCert(ca, domains)` - Create server cert
4. Implement `saveCertificates()` to `~/.mockmate/certs/`
5. Implement `loadCertificates()` for existing certs
6. Add certificate validation and expiry checks

**Testing:**
- Certificate generation
- Certificate loading
- Cert validity verification

#### Day 16: HTTPS Server (6-8 hours)

**Critical Files:**
- `packages/server/src/app.ts` (update)
- `packages/server/src/services/network.ts`

**Tasks:**
1. Create https.Server with generated certificates
2. Mount Express app on HTTPS server (port 3457)
3. Implement local IP detection (multiple network interfaces)
4. Start both HTTP (3456) and HTTPS (3457) servers
5. Log URLs for both servers with local IP

**Testing:**
- HTTPS connections
- Certificate trust warnings (expected)
- Both servers running simultaneously

### Sub-Phase 2.2: Device Setup Page (Days 17-18)

#### Day 17: Setup Page Backend (6-8 hours)

**Critical Files:**
- `packages/server/src/routes/setup.ts`
- `packages/server/src/services/certs/profile.ts`

**Tasks:**
1. Create route `GET /setup` - Render setup page HTML
2. Create route `GET /setup/ca.crt` - Download CA certificate
3. Create route `GET /setup/ios-profile` - Download .mobileconfig
4. Create route `GET /setup/qr` - QR code image
5. Implement iOS profile generation (XML with CA cert)
6. Install qrcode package and generate QR for setup URL

**Testing:**
- Profile download on iOS
- QR code scanning
- Certificate installation

#### Day 18: Setup Page Frontend (6-8 hours)

**Tasks:**
1. Create setup page UI (static HTML or React)
2. Display QR code for setup URL
3. Show iOS setup instructions with profile download
4. Show Android setup instructions (network_security_config.xml)
5. Add connection test button
6. Display base URL (https://LOCAL_IP:3457)

**Testing:**
- Real iOS device setup
- Real Android device setup
- HTTPS connection verification

### Sub-Phase 2.3: Dashboard Updates (Day 19)

#### Day 19: Device Setup UI (4-6 hours)

**Critical Files:**
- `packages/dashboard/src/components/DeviceSetup.tsx`

**Tasks:**
1. Add "Device Setup" section to dashboard header
2. Display QR code for setup page
3. Show local IP and HTTPS URL
4. Add link to setup page
5. Provide platform-specific instructions
6. Show server status (HTTP/HTTPS URLs)

---

## Phase 3: Enhanced Features (1-2 weeks)

**Goal:** Add advanced features for better testing workflows.

### Feature 3.1: Import from URL (Days 20-21)

**Critical Files:**
- `packages/server/src/services/import.ts`
- Admin API endpoint + Dashboard UI

**Tasks:**
1. Implement `fetchFromUrl(url, method, headers?, body?)`
2. Parse real API response (status, headers, body)
3. Create scenario from response
4. Add `POST /api/admin/projects/:id/resources/import` endpoint
5. Create "Import from URL" modal in dashboard
6. Add optional headers and body inputs

### Feature 3.2: Export/Import Projects (Day 22)

**Tasks:**
1. Implement `exportProject(projectId)` - Serialize to JSON
2. Implement `importProject(jsonData)` - Parse and create project
3. Add `GET /api/admin/projects/:id/export` endpoint
4. Add `POST /api/admin/projects/import` endpoint
5. Add export button per project in dashboard
6. Add import button with file upload dialog

### Feature 3.3: Faker.js Integration (Days 23-24)

**Critical Files:**
- `packages/server/src/services/faker.ts`

**Tasks:**
1. Install faker.js
2. Implement `resolveFakerTokens(body)` - Replace `{{faker.name.firstName}}` etc.
3. Apply faker resolution before returning response
4. Add "Insert Faker" button in JSON editor
5. Create dropdown with common faker methods
6. Add preview for fake data

### Feature 3.4: Response Templating (Day 25)

**Critical Files:**
- `packages/server/src/services/template.ts`

**Tasks:**
1. Implement `resolveTemplates(body)` for dynamic values
2. Support built-in templates:
   - `{{$timestamp}}` - Current Unix timestamp
   - `{{$iso}}` - ISO date string
   - `{{$uuid}}` - Random UUID
   - `{{$random}}` - Random number
3. Apply after faker resolution on each request

### Feature 3.5: Request Body Matching (Days 26-27)

**Tasks:**
1. Add `requestMatcher` to Scenario interface
2. Implement JSON path matching
3. Add regex support for body fields
4. Update request matching logic to evaluate matchers
5. Add "Request Matcher" section in scenario editor
6. Add matcher testing with sample request

### Feature 3.6: Global Delay Simulation (Day 28)

**Tasks:**
1. Add global delay setting to project configuration
2. Support min/max random delay range
3. Make scenario delay take precedence over global
4. Add global delay input in project settings
5. Add toggle to enable/disable

---

## Project Structure

```
mockmate/
├── packages/
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts                 # Entry point
│   │   │   ├── app.ts                   # Express config
│   │   │   ├── types.ts                 # TypeScript interfaces
│   │   │   ├── routes/
│   │   │   │   ├── admin.ts            # Admin API
│   │   │   │   ├── mock.ts             # Mock handler
│   │   │   │   └── setup.ts            # Device setup (Phase 2)
│   │   │   ├── services/
│   │   │   │   ├── storage.ts          # File operations
│   │   │   │   ├── projects.ts         # Project CRUD
│   │   │   │   ├── resources.ts        # Resource CRUD
│   │   │   │   ├── scenarios.ts        # Scenario ops
│   │   │   │   ├── matcher.ts          # Request matching
│   │   │   │   ├── websocket.ts        # WebSocket server
│   │   │   │   └── network.ts          # IP detection (Phase 2)
│   │   │   ├── certs/                  # Phase 2
│   │   │   │   ├── generator.ts        # CA/cert generation
│   │   │   │   └── profile.ts          # iOS profile
│   │   │   └── middleware/
│   │   │       ├── cors.ts
│   │   │       ├── logger.ts
│   │   │       └── error.ts
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   └── dashboard/
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   ├── ProjectList.tsx
│       │   │   ├── ProjectModal.tsx
│       │   │   ├── ResourceList.tsx
│       │   │   ├── ResourceEditor.tsx
│       │   │   ├── ScenarioEditor.tsx
│       │   │   ├── ScenarioSwitcher.tsx
│       │   │   ├── RequestLog.tsx
│       │   │   └── DeviceSetup.tsx     # Phase 2
│       │   ├── hooks/
│       │   │   ├── useProjects.ts
│       │   │   ├── useResources.ts
│       │   │   ├── useWebSocket.ts
│       │   │   └── useApi.ts
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   └── types.ts
│       │   └── store/
│       │       └── index.ts
│       └── vite.config.ts
├── docs/
├── package.json                        # Workspace root
├── tsconfig.json                       # Shared TS config
└── README.md
```

---

## Storage Structure

```
~/.mockmate/
├── config.json                         # Global config (active project)
├── projects/
│   ├── xstream-play/
│   │   ├── project.json               # Project metadata
│   │   └── resources/
│   │       ├── GET_api_home_banners.json
│   │       └── GET_api_user_profile.json
└── certs/                             # Phase 2
    ├── ca.crt
    └── server.crt
```

---

## Dependencies

### Backend (packages/server/package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "node-forge": "^1.3.1",
    "cors": "^2.8.5",
    "uuid": "^9.0.1",
    "@faker-js/faker": "^8.3.1",
    "qrcode": "^1.5.3",
    "jsonpath-plus": "^7.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/ws": "^8.5.8",
    "@types/node-forge": "^1.3.9",
    "@types/cors": "^2.8.16",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.0.0"
  }
}
```

### Frontend (packages/dashboard/package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "@monaco-editor/react": "^4.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "typescript": "^5.3.0"
  }
}
```

---

## Critical Implementation Notes

### 1. Request Matching Logic
- Convert resource paths like `/api/users/:id` to regex patterns
- Extract path parameters and make available in request context
- Match by method + path
- Return 404 for unmatched requests

### 2. Scenario Selection & Fallback
- **Priority order:** Header-specified (`X-MockMate-Scenario`) → Active scenario → Default
- Always ensure "default" scenario exists on resource creation
- If requested scenario not found, fall back to "default"
- Never allow deletion of "default" scenario
- Header-based selection allows per-request scenario override without changing global state

### 3. File Storage
- Use slugified project names for folder names
- Use `METHOD_path` for resource filenames (e.g., `GET_api_users_id.json`)
- Handle concurrent file access with locking or queue

### 4. CORS Configuration
- Allow all origins by default for mock server
- Handle OPTIONS preflight requests
- Include proper CORS headers in all responses

### 5. WebSocket Reconnection
- Frontend should auto-reconnect with exponential backoff
- Send last 100 log entries on new connection
- Handle server restart gracefully

### 6. Certificate Trust
- Guide users through CA installation on devices
- Provide clear step-by-step instructions
- Include screenshots in documentation

---

## Success Criteria

### Phase 1
- ✅ User can create project in < 1 minute
- ✅ User can add resource with scenarios in < 2 minutes
- ✅ User can switch scenarios and see immediate effect
- ✅ Simulator connects and receives mock responses
- ✅ Request log shows real-time activity

### Phase 2
- ✅ Certificates auto-generate on first run
- ✅ Setup page accessible via QR code
- ✅ iOS device successfully installs CA and connects via HTTPS
- ✅ Android device successfully adds CA and connects via HTTPS
- ✅ Connection test passes on real devices

### Phase 3
- ✅ User can import API response from URL
- ✅ User can export/import projects
- ✅ Faker.js generates realistic test data
- ✅ Templates provide dynamic values

---

## Next Steps After Planning

1. Initialize monorepo structure with npm workspaces
2. Set up TypeScript configuration
3. Create `packages/server` and `packages/dashboard` directories
4. Install initial dependencies
5. Begin Day 1 implementation: Storage Layer Foundation
