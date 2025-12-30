# MockMate - Product Requirements Document v2

**Version:** 2.0  
**Date:** December 30, 2025  
**Author:** Aman  
**Status:** Draft

---

## Executive Summary

MockMate is a **local mock API server** for mobile developers that enables testing multiple scenarios for the same API endpoints. Unlike cloud-based solutions (mockapi.io), MockMate runs entirely on your machine with support for HTTPS, making it ideal for iOS/Android development where App Transport Security requires secure connections.

**Key Differentiator:** Scenario-based testing - switch between "empty state", "error state", "slow network" scenarios instantly without code changes.

---

## Problem Statement

### mockapi.io Limitations

| Limitation | Impact |
|------------|--------|
| Cloud-based | Requires internet, latency issues |
| No HTTPS on custom domains | iOS ATS blocks HTTP |
| Single data set | Can't easily test empty/error states |
| No scenario switching | Must manually edit data for each test |
| Rate limits on free tier | Slows development |

### What Developers Need

1. **Local server** - No internet dependency, zero latency
2. **HTTPS support** - Works with iOS ATS, Android network security
3. **Multiple scenarios** - Test happy path, empty state, errors without code changes
4. **Quick switching** - Change scenarios via dashboard, not manual data editing
5. **Real device support** - Test on physical iOS/Android devices

---

## Core Concepts

### Hierarchy

```
MockMate
└── Projects (e.g., "Xstream Play", "My Shopping App")
    └── Resources (e.g., "/api/cart", "/api/user")
        └── Scenarios (e.g., "default", "empty", "error")
            └── Response (JSON body, status, delay, headers)
```

### Example Structure

```
Project: Xstream Play
├── Resource: GET /api/home/banners
│   ├── Scenario: default     → 200, [{banner1}, {banner2}]
│   ├── Scenario: empty       → 200, []
│   └── Scenario: error       → 500, {"error": "Server error"}
│
├── Resource: GET /api/user/profile
│   ├── Scenario: default     → 200, {name: "John", avatar: "..."}
│   ├── Scenario: no_avatar   → 200, {name: "John", avatar: null}
│   └── Scenario: logged_out  → 401, {"error": "Unauthorized"}
│
└── Resource: POST /api/subscription/purchase
    ├── Scenario: success     → 200, {subscriptionId: "..."}
    ├── Scenario: payment_fail→ 402, {"error": "Payment failed"}
    └── Scenario: slow        → 200, {subscriptionId: "..."}, delay: 5000ms
```

### Active Scenario

Each project has an **active scenario set**. When you select "empty" scenario:
- All resources that have an "empty" scenario will return that response
- Resources without "empty" scenario fall back to "default"

```
Project: Xstream Play
Active Scenario: "empty"

GET /api/home/banners  → Returns "empty" scenario (empty array)
GET /api/user/profile  → Returns "default" scenario (no "empty" defined)
```

---

## User Interface

### Option A: Web Dashboard (Recommended for MVP)

A local web interface at `http://localhost:3456/dashboard`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MockMate                                              [Settings] [Docs]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Projects                          Xstream Play                         │
│  ┌─────────────────────┐          ┌────────────────────────────────────┐│
│  │ ▶ Xstream Play     │          │ Base URL: https://localhost:3457   ││
│  │   My Shopping App  │          │ Active Scenario: [default ▼]       ││
│  │   + New Project    │          │                                    ││
│  └─────────────────────┘          │ Resources (4)            [+ Add]  ││
│                                   │ ┌────────────────────────────────┐││
│                                   │ │ GET  /api/home/banners        │││
│                                   │ │      Scenarios: 3  [Edit]     │││
│                                   │ ├────────────────────────────────┤││
│                                   │ │ GET  /api/user/profile        │││
│                                   │ │      Scenarios: 3  [Edit]     │││
│                                   │ ├────────────────────────────────┤││
│                                   │ │ POST /api/subscription/buy    │││
│                                   │ │      Scenarios: 2  [Edit]     │││
│                                   │ ├────────────────────────────────┤││
│                                   │ │ GET  /api/content/:id         │││
│                                   │ │      Scenarios: 1  [Edit]     │││
│                                   │ └────────────────────────────────┘││
│                                   │                                    ││
│                                   │ Request Log                [Clear]││
│                                   │ ┌────────────────────────────────┐││
│                                   │ │ 12:34:01 GET /api/home/banners ││
│                                   │ │ 12:34:02 GET /api/user/profile ││
│                                   │ │ 12:34:05 POST /api/sub/buy     ││
│                                   │ └────────────────────────────────┘││
│                                   └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Resource Editor Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Edit Resource                                                    [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Method: [GET ▼]     Path: [/api/home/banners          ]               │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Scenarios                                               [+ Add Scenario]│
│                                                                         │
│  ┌─ default ──────────────────────────────────────────────────────────┐ │
│  │  Status: [200 ▼]    Delay: [0    ] ms    Headers: [+ Add]          │ │
│  │                                                                     │ │
│  │  Response Body:                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ [                                                           │   │ │
│  │  │   {"id": 1, "title": "Banner 1", "image": "..."},          │   │ │
│  │  │   {"id": 2, "title": "Banner 2", "image": "..."}           │   │ │
│  │  │ ]                                                           │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                           [Duplicate] [Delete]      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─ empty ────────────────────────────────────────────────────────────┐ │
│  │  Status: [200 ▼]    Delay: [0    ] ms                              │ │
│  │  Response Body:                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ []                                                          │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                           [Duplicate] [Delete]      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─ error ────────────────────────────────────────────────────────────┐ │
│  │  Status: [500 ▼]    Delay: [0    ] ms                              │ │
│  │  Response Body:                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ {"error": "Internal server error", "code": "ERR_500"}       │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                           [Duplicate] [Delete]      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                    [Cancel] [Save]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Option B: CLI Only (Alternative)

For developers who prefer terminal:

```bash
# Project management
mockmate projects list
mockmate projects create "Xstream Play"
mockmate projects delete "Xstream Play"

# Resource management
mockmate resources add GET /api/home/banners --project "Xstream Play"
mockmate resources list --project "Xstream Play"

# Scenario management
mockmate scenarios add default --resource "GET /api/home/banners" --body '[{"id":1}]'
mockmate scenarios add empty --resource "GET /api/home/banners" --body '[]'
mockmate scenarios switch empty --project "Xstream Play"

# Server
mockmate start --project "Xstream Play"
mockmate start --project "Xstream Play" --https
```

**Recommendation:** Build Web Dashboard for MVP. CLI can come later for automation/CI.

---

## Feature Specification

### Phase 1: MVP - Simulator Support

#### P1.1: Project Management

| Feature | Description |
|---------|-------------|
| Create Project | Name, optional description |
| List Projects | Show all projects with resource count |
| Delete Project | Remove project and all its data |
| Select Project | Choose active project for server |

#### P1.2: Resource Management

| Feature | Description |
|---------|-------------|
| Create Resource | Method (GET/POST/PUT/DELETE/PATCH) + Path |
| Path Parameters | Support `/api/users/:id` style params |
| Query Parameters | Ignore query params in matching (configurable) |
| List Resources | Show all resources in project |
| Delete Resource | Remove resource and all scenarios |

#### P1.3: Scenario Management

| Feature | Description |
|---------|-------------|
| Create Scenario | Name + Response body + Status code + Delay + Headers |
| Default Scenario | Every resource has a "default" scenario |
| Edit Scenario | Modify response, status, delay, headers |
| Duplicate Scenario | Clone scenario with new name |
| Delete Scenario | Remove scenario (can't delete default) |
| Switch Scenario | Activate scenario for entire project |

#### P1.4: Mock Server

| Feature | Description |
|---------|-------------|
| HTTP Server | Serve on configurable port (default: 3456) |
| Request Matching | Match method + path to resource |
| Response Serving | Return active scenario's response |
| Request Logging | Log all incoming requests |
| CORS Support | Allow requests from any origin |

#### P1.5: Web Dashboard

| Feature | Description |
|---------|-------------|
| Project List | Sidebar with all projects |
| Resource List | Main area showing project resources |
| Resource Editor | Modal to edit resource and scenarios |
| Scenario Switcher | Dropdown to change active scenario |
| Request Log | Real-time log of requests |
| JSON Editor | Syntax highlighting, validation |

### Phase 2: Real Device Support

#### P2.1: HTTPS Server

| Feature | Description |
|---------|-------------|
| Certificate Generation | Auto-generate CA and server cert |
| Local IP Detection | Find machine's network IP |
| HTTPS Server | Serve on port 3457 |
| Cert Storage | Save in `~/.mockmate/certs/` |

#### P2.2: Device Setup

| Feature | Description |
|---------|-------------|
| Setup Page | HTTP page at `:3456/setup` |
| QR Code | Scan to open setup on device |
| iOS Profile | Download `.mobileconfig` |
| Android Guide | Instructions for network_security_config |
| Connection Test | Verify HTTPS works |

### Phase 3: Enhanced Features

| Feature | Description |
|---------|-------------|
| Import from URL | Fetch real API response, save as scenario |
| Export/Import | Share project configs as JSON |
| Faker.js Integration | Generate fake data in responses |
| Response Templating | Dynamic values like `{{$timestamp}}` |
| Request Body Matching | Different response based on request body |
| Delay Simulation | Global delay for all endpoints |
| Auto-save | Save changes automatically |

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              MockMate                                    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Web Dashboard                              │   │
│  │                     (React/Next.js/Vite)                         │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │  Projects   │  │  Resources  │  │   Scenario Editor       │  │   │
│  │  │  Sidebar    │  │  List       │  │   (Monaco/CodeMirror)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ REST API                            │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Backend Server                             │   │
│  │                         (Express.js)                              │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │  Admin API  │  │  Mock API   │  │   WebSocket             │  │   │
│  │  │  /api/*     │  │  /*         │  │   (Request Log)         │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Storage Layer                              │   │
│  │                       (JSON Files)                                │   │
│  │                                                                   │   │
│  │  ~/.mockmate/                                                     │   │
│  │  ├── config.json                                                  │   │
│  │  ├── projects/                                                    │   │
│  │  │   ├── xstream-play/                                           │   │
│  │  │   │   ├── project.json                                        │   │
│  │  │   │   └── resources/                                          │   │
│  │  │   │       ├── get-api-home-banners.json                       │   │
│  │  │   │       └── get-api-user-profile.json                       │   │
│  │  │   └── my-shopping-app/                                        │   │
│  │  └── certs/                                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Models

#### Project

```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // "Xstream Play"
  slug: string;                  // "xstream-play" (folder name)
  description?: string;
  activeScenario: string;        // "default"
  createdAt: string;             // ISO date
  updatedAt: string;
}
```

#### Resource

```typescript
interface Resource {
  id: string;                    // UUID
  projectId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;                  // "/api/home/banners" or "/api/users/:id"
  description?: string;
  scenarios: Scenario[];
  createdAt: string;
  updatedAt: string;
}
```

#### Scenario

```typescript
interface Scenario {
  name: string;                  // "default", "empty", "error"
  statusCode: number;            // 200, 404, 500, etc.
  delay: number;                 // milliseconds
  headers?: Record<string, string>;
  body: any;                     // JSON response body
}
```

### Storage Structure

```
~/.mockmate/
├── config.json                           # Global config
├── projects/
│   ├── xstream-play/
│   │   ├── project.json                  # Project metadata
│   │   └── resources/
│   │       ├── GET_api_home_banners.json
│   │       ├── GET_api_user_profile.json
│   │       ├── POST_api_subscription_buy.json
│   │       └── GET_api_content_[id].json # Path params use [param]
│   └── my-shopping-app/
│       ├── project.json
│       └── resources/
│           └── ...
└── certs/                                # Phase 2
    ├── ca.crt
    ├── ca.key
    ├── server.crt
    └── server.key
```

#### config.json

```json
{
  "httpPort": 3456,
  "httpsPort": 3457,
  "dashboardPort": 3456,
  "activeProject": "xstream-play",
  "enableRequestLogging": true,
  "maxLogEntries": 100
}
```

#### project.json

```json
{
  "id": "proj_abc123",
  "name": "Xstream Play",
  "slug": "xstream-play",
  "description": "Airtel Xstream streaming app",
  "activeScenario": "default",
  "createdAt": "2025-12-30T10:00:00Z",
  "updatedAt": "2025-12-30T10:00:00Z"
}
```

#### GET_api_home_banners.json

```json
{
  "id": "res_xyz789",
  "projectId": "proj_abc123",
  "method": "GET",
  "path": "/api/home/banners",
  "description": "Home screen promotional banners",
  "scenarios": [
    {
      "name": "default",
      "statusCode": 200,
      "delay": 0,
      "headers": {
        "X-Custom-Header": "value"
      },
      "body": [
        {"id": 1, "title": "Banner 1", "image": "https://..."},
        {"id": 2, "title": "Banner 2", "image": "https://..."}
      ]
    },
    {
      "name": "empty",
      "statusCode": 200,
      "delay": 0,
      "body": []
    },
    {
      "name": "error",
      "statusCode": 500,
      "delay": 0,
      "body": {
        "error": "Internal server error",
        "code": "ERR_500"
      }
    },
    {
      "name": "slow",
      "statusCode": 200,
      "delay": 3000,
      "body": [
        {"id": 1, "title": "Banner 1", "image": "https://..."}
      ]
    }
  ],
  "createdAt": "2025-12-30T10:00:00Z",
  "updatedAt": "2025-12-30T10:00:00Z"
}
```

### API Endpoints

#### Admin API (Dashboard Backend)

```
# Projects
GET    /api/admin/projects              # List all projects
POST   /api/admin/projects              # Create project
GET    /api/admin/projects/:id          # Get project details
PUT    /api/admin/projects/:id          # Update project
DELETE /api/admin/projects/:id          # Delete project

# Resources
GET    /api/admin/projects/:id/resources           # List resources
POST   /api/admin/projects/:id/resources           # Create resource
GET    /api/admin/projects/:id/resources/:resId    # Get resource
PUT    /api/admin/projects/:id/resources/:resId    # Update resource
DELETE /api/admin/projects/:id/resources/:resId    # Delete resource

# Scenarios
PUT    /api/admin/projects/:id/scenario            # Switch active scenario
POST   /api/admin/projects/:id/resources/:resId/scenarios    # Add scenario
DELETE /api/admin/projects/:id/resources/:resId/scenarios/:name  # Delete scenario

# Server Control
GET    /api/admin/status                # Server status
POST   /api/admin/start                 # Start mock server
POST   /api/admin/stop                  # Stop mock server
GET    /api/admin/logs                  # Get request log
DELETE /api/admin/logs                  # Clear request log

# Import/Export
GET    /api/admin/projects/:id/export   # Export project as JSON
POST   /api/admin/import                # Import project from JSON
POST   /api/admin/record                # Record response from URL
```

#### Mock API

All non-admin routes are handled by the mock server:

```
GET    /api/home/banners               # Matched to resource, returns scenario
POST   /api/subscription/buy           # Matched to resource, returns scenario
GET    /api/users/123                  # Path param matched, returns scenario
```

### Request Matching Logic

```typescript
function matchRequest(req: Request, resources: Resource[]): Resource | null {
  for (const resource of resources) {
    if (resource.method !== req.method) continue;
    
    // Convert path pattern to regex
    // /api/users/:id → /api/users/([^/]+)
    const pattern = resource.path.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    
    if (regex.test(req.path)) {
      return resource;
    }
  }
  return null;
}

function getResponse(resource: Resource, activeScenario: string): Scenario {
  // Try to find the active scenario
  const scenario = resource.scenarios.find(s => s.name === activeScenario);
  
  // Fall back to default if not found
  if (!scenario) {
    return resource.scenarios.find(s => s.name === 'default')!;
  }
  
  return scenario;
}
```

---

## Technology Stack

### Backend

| Component | Technology | Reason |
|-----------|------------|--------|
| Runtime | Node.js 20+ | Familiar, good ecosystem |
| Language | TypeScript | Type safety |
| Server | Express.js | Simple, mature |
| WebSocket | ws | Real-time request log |
| Certificates | node-forge | Pure JS, no native deps |

### Frontend (Dashboard)

| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | React 18 | Standard, well-known |
| Build Tool | Vite | Fast, simple config |
| Styling | Tailwind CSS | Rapid UI development |
| State | Zustand or React Query | Simple state management |
| JSON Editor | Monaco Editor | VS Code-like editing |
| HTTP Client | fetch | No external deps |

### Alternative: Single Binary

For easier distribution, could bundle everything:

| Component | Technology |
|-----------|------------|
| Bundler | pkg or nexe |
| Frontend | Embedded in binary |

---

## Development Phases

### Phase 1: MVP - Simulator Support (2 Weeks)

#### Week 1: Backend Core

| Day | Task | Hours |
|-----|------|-------|
| 1 | Project setup (monorepo, TypeScript) | 4 |
| 1 | Storage layer (read/write JSON files) | 4 |
| 2 | Project CRUD operations | 4 |
| 2 | Resource CRUD operations | 4 |
| 3 | Scenario management | 4 |
| 3 | Mock server (request matching) | 4 |
| 4 | Admin API endpoints | 6 |
| 4 | Request logging | 2 |
| 5 | WebSocket for real-time logs | 4 |
| 5 | Testing | 4 |

#### Week 2: Frontend Dashboard

| Day | Task | Hours |
|-----|------|-------|
| 1 | Vite + React + Tailwind setup | 3 |
| 1 | Layout (sidebar, main area) | 5 |
| 2 | Project list component | 4 |
| 2 | Resource list component | 4 |
| 3 | Resource editor modal | 6 |
| 3 | Scenario editor with JSON | 2 |
| 4 | Scenario switcher dropdown | 3 |
| 4 | Request log (WebSocket) | 5 |
| 5 | Polish, error handling | 4 |
| 5 | Testing with iOS simulator | 4 |

**Deliverables:**
- [ ] `npx mockmate` starts server with dashboard
- [ ] Create projects and resources via UI
- [ ] Switch scenarios with one click
- [ ] See request log in real-time
- [ ] Works with iOS/Android simulator

### Phase 2: Real Device Support (1 Week)

| Day | Task | Hours |
|-----|------|-------|
| 1 | Certificate generation (node-forge) | 6 |
| 1 | Local IP detection | 2 |
| 2 | HTTPS server setup | 4 |
| 2 | Setup page HTML | 4 |
| 3 | QR code generation | 2 |
| 3 | iOS .mobileconfig generation | 4 |
| 3 | Android setup instructions | 2 |
| 4 | Dashboard UI for device setup | 4 |
| 4 | Testing on real devices | 4 |
| 5 | Documentation | 4 |
| 5 | Bug fixes | 4 |

**Deliverables:**
- [ ] HTTPS server on local network
- [ ] Device setup page with certificate download
- [ ] QR code for easy access
- [ ] Works on real iOS and Android devices

### Phase 3: Polish & Features (1-2 Weeks)

| Feature | Days |
|---------|------|
| Import from URL (record response) | 1 |
| Export/Import projects | 1 |
| Faker.js integration | 2 |
| Response templating | 2 |
| CLI commands | 2 |
| npm publish | 1 |
| Documentation site | 2 |

---

## User Flows

### Flow 1: First Time Setup

```
1. Developer runs: npx mockmate
2. Browser opens: http://localhost:3456
3. Dashboard shows: "Welcome! Create your first project"
4. Developer clicks: "+ New Project"
5. Developer enters: "Xstream Play"
6. Project created, empty resource list shown
7. Developer adds resources and scenarios
8. Developer configures app to use: http://localhost:3456
```

### Flow 2: Creating Test Scenarios

```
1. Developer clicks: "+ Add Resource"
2. Developer selects: GET, enters: /api/home/banners
3. Modal opens with default scenario
4. Developer pastes JSON response body
5. Developer clicks: "+ Add Scenario", names it "empty"
6. Developer enters empty array: []
7. Developer clicks: "+ Add Scenario", names it "error"  
8. Developer sets status 500, enters error JSON
9. Developer clicks: Save
10. Resource appears in list with "3 scenarios"
```

### Flow 3: Testing Different States

```
1. Developer has app running on simulator
2. App shows home screen with banners (default scenario)
3. Developer opens MockMate dashboard
4. Developer changes "Active Scenario" to "empty"
5. Developer refreshes app
6. App shows "No banners" empty state
7. Developer changes to "error" scenario
8. Developer refreshes app
9. App shows error screen
```

### Flow 4: Real Device Testing

```
1. Developer clicks "Device Setup" in dashboard
2. Dashboard shows QR code and local IP
3. Developer opens Camera on iPhone
4. Scans QR code, Safari opens setup page
5. Developer taps "Install Certificate"
6. Goes to Settings → Profile Downloaded → Install
7. Goes to Settings → General → About → Certificate Trust
8. Enables trust for MockMate CA
9. Developer configures app: https://192.168.1.100:3457
10. App works with mock server over HTTPS
```

---

## Comparison with Alternatives

| Feature | MockMate | mockapi.io | WireMock | Mockoon |
|---------|----------|------------|----------|---------|
| Local | ✅ | ❌ Cloud | ✅ | ✅ |
| HTTPS Easy Setup | ✅ | ❌ | ❌ Manual | ❌ Manual |
| Scenarios | ✅ Built-in | ❌ | ✅ | ✅ |
| Web Dashboard | ✅ | ✅ | ❌ | ✅ |
| Mobile-First | ✅ | ❌ | ❌ | ❌ |
| Real Device | ✅ Easy | ❌ | ❌ Hard | ❌ Hard |
| Free | ✅ | Limited | ✅ | ✅ |
| Setup Time | 1 min | 5 min | 30 min | 10 min |
| Learning Curve | Low | Low | High | Medium |

---

## File Structure

```
mockmate/
├── packages/
│   ├── server/                    # Backend
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── app.ts             # Express app
│   │   │   ├── routes/
│   │   │   │   ├── admin.ts       # Admin API routes
│   │   │   │   └── mock.ts        # Mock server routes
│   │   │   ├── services/
│   │   │   │   ├── storage.ts     # File storage
│   │   │   │   ├── projects.ts    # Project operations
│   │   │   │   ├── resources.ts   # Resource operations
│   │   │   │   └── scenarios.ts   # Scenario operations
│   │   │   ├── middleware/
│   │   │   │   ├── cors.ts
│   │   │   │   └── logger.ts
│   │   │   ├── certs/             # Phase 2
│   │   │   │   ├── generator.ts
│   │   │   │   └── profile.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── dashboard/                 # Frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── ProjectList.tsx
│       │   │   ├── ResourceList.tsx
│       │   │   ├── ResourceEditor.tsx
│       │   │   ├── ScenarioEditor.tsx
│       │   │   ├── RequestLog.tsx
│       │   │   └── DeviceSetup.tsx
│       │   ├── hooks/
│       │   │   ├── useProjects.ts
│       │   │   ├── useResources.ts
│       │   │   └── useWebSocket.ts
│       │   ├── api/
│       │   │   └── client.ts
│       │   └── styles/
│       │       └── globals.css
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
│
├── docs/
│   ├── getting-started.md
│   ├── device-setup.md
│   └── api-reference.md
│
├── package.json                   # Workspace root
├── pnpm-workspace.yaml
└── README.md
```

---

## Success Metrics

### Phase 1

| Metric | Target |
|--------|--------|
| Setup to first mock | < 5 minutes |
| Create resource | < 30 seconds |
| Switch scenario | < 1 second |
| Dashboard load time | < 2 seconds |

### Phase 2

| Metric | Target |
|--------|--------|
| Device setup time | < 10 minutes (one-time) |
| HTTPS working | First try success |
| Connection test | Passes on real device |

### Post-Launch

| Metric | Target |
|--------|--------|
| npm weekly downloads | 200+ first month |
| GitHub stars | 100+ first month |

---

## Open Questions

1. **Single port vs multi-port?**
   - Option A: Port 3456 for both dashboard and mock API (differentiate by path)
   - Option B: Port 3456 for dashboard, 3457 for mock API
   - **Recommendation:** Option A (simpler for users)

2. **Default scenarios naming?**
   - Enforce standard names (default, empty, error, slow)?
   - Or free-form names?
   - **Recommendation:** Free-form, but suggest common ones

3. **Request body matching?**
   - Match only on path+method?
   - Or also match request body content?
   - **Recommendation:** Path+method only for MVP, add body matching later

4. **Data persistence format?**
   - JSON files (simple, git-friendly)?
   - SQLite (faster for many resources)?
   - **Recommendation:** JSON files for MVP

---

## Next Steps

1. ✅ Finalize this PRD
2. Set up repository with monorepo structure
3. Implement backend storage layer
4. Implement admin API
5. Create basic dashboard UI
6. Test with iOS simulator
7. Add HTTPS support (Phase 2)
8. Test with real devices
9. Publish to npm

---

**Document History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-29 | Initial draft with MCP |
| 2.0 | 2025-12-30 | Removed MCP, added project/scenario hierarchy, Web Dashboard focus |
