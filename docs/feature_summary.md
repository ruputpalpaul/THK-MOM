# THK-MOM Application Feature Summary

## 1. Application Overview
**THK-MOM (Manufacturing Overview Model)** is a modern, single-page application designed to centralize manufacturing intelligence. It provides real-time visibility into production status, machine health, and operational workflows across different plant areas (Fabrication, Assembly/Green Room, Shipping).

## 2. Key Features

### 2.1 Interactive Dashboards
The application features specialized dashboards for different operational needs:
- **Home Dashboard**: High-level executive summary with global KPIs (Uptime, Plan Attainment, Scrap, Open Issues).
- **Production Overview**: Aggregated metrics across all plant areas.
- **Green Room (Assembly)**: Detailed view of assembly machines, including status tiles, floor map view, and maintenance tracking.
- **Fabrication**: Similar to Green Room but tailored for fabrication processes (cutting, grinding, molding).
- **Shipping**: Logistics-focused view tracking shipping orders, part readiness, and delivery schedules.
- **Machine Planner**: Drag-and-drop interface for managing machine area assignments.
- **Tool Life Estimation**: Analytics view for tracking tool usage and predicting replacements.

### 2.2 Machine Management
- **Universal Machine Sidebar**: A context-aware drawer accessible from anywhere, providing instant access to:
  - Real-time Status (Active, Down, Maintenance) & OEE Metrics.
  - Production Targets vs. Actuals.
  - Recent Documents (Manuals, Backups).
  - Open Work Orders & Issues.
  - e-Andon (Help Request) functionality.
- **Machine Details Page**: Deep dive into a specific machine's history, settings, components, and ECOs.
- **Status Control**: Operators can change machine status and log downtime reasons directly.

### 2.3 Operational Workflows
- **Work Orders**: Create, track, and manage maintenance or corrective tasks.
- **Engineering Change Orders (ECOs)**: Manage engineering changes with approval workflows and impact analysis.
- **Document Management**: Upload and associate manuals, backups, and drawings with specific machines.
- **Event Logging**: Record downtime events, maintenance activities, and notes.

### 2.4 Navigation & Usability
- **Global Search**: `Cmd+K` style search to quickly find machines, orders, or documents.
- **Role-Based Access Control (RBAC)**:
  - User personas (Admin, Engineer, Maintenance, Supervisor, Worker, Viewer).
  - Feature gating (e.g., only Admins see Machine Planner).
  - Area-specific access restrictions.
- **Quick Actions**: Always-visible buttons for common tasks (Upload, Note, Event, Work Order, ECO).

## 3. Technical Architecture

### 3.1 Frontend Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix Primitives)
- **Icons**: Lucide React
- **Animations**: Framer Motion

### 3.2 Data Layer
- **Hybrid Architecture**:
  - **Mock Mode**: Default in-memory database (`src/data/mock-data.ts`) for offline development and demos.
  - **Live Mode**: Configurable via `VITE_USE_LIVE_API` to connect to real backend endpoints.
- **API Abstraction**: `src/utils/api.ts` provides a unified interface for data access, seamlessly switching between mock and live providers.

### 3.3 State Management
- **Local State**: React `useState` / `useReducer` for UI state.
- **Global State**: Context providers for Authentication (`AuthProvider`) and Alerts (`AlertProvider`).
- **Persistence**: User preferences (e.g., default area, filters) are persisted to `localStorage`.

## 4. Security & Integration
- **Authentication**: Supports role-based capability checks (`hasCapability`).
- **Alerting**: Built-in alert evaluation engine runs periodically to detect critical conditions.
- **External Hooks**: Webhook support for SMS/Email notifications on critical alerts.
