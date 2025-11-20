# THK-MOM Application Structure Documentation

## 1. Overview
**THK-MOM (Manufacturing Overview Model)** is a React-based web application designed to manage manufacturing operations, including machine monitoring, work orders, engineering change orders (ECOs), and production tracking.

### Tech Stack
- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI, Lucide React Icons
- **State Management**: React Context (AuthProvider), Local Component State
- **Animation**: Framer Motion
- **Notifications**: Sonner

## 2. Access Control & Authentication
Managed by `AuthProvider.tsx`.

### Roles
- **Admin**: Full access to all capabilities.
- **Manager**: Can manage resources but limited system config.
- **Supervisor**: Focus on production oversight and reporting.
- **Operator**: Limited to viewing and basic logging.
- **Engineer**: Focus on ECOs and technical data.

### Capabilities
Access is controlled via granular capabilities (e.g., `view:production`, `manage:workorders`).

## 3. Navigation Structure
The application uses a single-page architecture with a sidebar/sheet navigation managed in `App.tsx`.

### Areas
1.  **Overview**
    -   **Home**: High-level KPI dashboard.
2.  **Plant Floor**
    -   **Production**: Overview of all production lines.
    -   **Fabrication**: Detailed view of fabrication machines.
    -   **Green Room**: Detailed view of Green Room machines.
    -   **Shipping**: Shipping orders and logistics.
3.  **Management**
    -   **Machine Planner**: Gantt-chart style machine scheduling.
    -   **Tool Life**: Analytics for tool usage and maintenance.

## 4. Dashboards & Views
Detailed breakdown of each major view.

### 4.1 Home Dashboard (`HomeDashboard.tsx`)
The landing page providing a high-level overview of the entire plant.
-   **KPI Tiles**:
    -   **Total Machines**: Opens drawer with full machine list.
    -   **Uptime**: Shows active vs total machines. Opens drawer with active machines.
    -   **Plan Attainment**: Production target vs actual. Navigates to Production Overview.
    -   **Scrap Today**: Total scrap count. Navigates to Production Overview.
    -   **Pending WOs**: Count of open work orders. Opens drawer with pending WOs.
    -   **ECOs in Review**: Count of ECOs in review. Opens drawer with ECOs.
-   **Area Overview Cards**: Summary cards for Production, Fabrication, Green Room, and Shipping, allowing navigation to specific dashboards.
-   **Today's Production**: Bar chart style summary of Target vs Actual.
-   **Recent Events**: Table showing the latest 6 machine events.
-   **Open Work Orders**: Table showing the latest 6 open work orders.
-   **DrillDownDrawer**: A side panel used to display detailed lists (Machines, WOs, ECOs) without leaving the dashboard.

### 4.2 Production Overview (`ProductionOverviewDashboard.tsx`)
Aggregated view of all production areas.
-   **Global Stats**: Total Machines, Open Work Orders, Shipping Orders.
-   **Area Cards**:
    -   **Fabrication**: Shows machine count, uptime, and open WOs.
    -   **Green Room**: Shows machine count, uptime, and PM jobs.
    -   **Shipping**: Shows machine count and open shipping orders.
    -   Each card has drill-down links for Machines, Active, Down/Maint, and specific attention items.

### 4.3 Fabrication Dashboard (`FabricationDashboard.tsx`)
Detailed view for the Fabrication area.
-   **KPI Tiles**: Filtered Machines, Active Count, Pending Maintenance, ECOs in Review, Old Backups.
-   **Floor Map**: Interactive map (`FloorMapView`) showing machine status and location.
-   **Lines Utilization**: Progress bars showing production attainment per category.
-   **Machine Sections**: Accordion list grouping machines by category (e.g., Block Grinding, Cutting).
-   **Shift Handoff Notes**: Simple note-taking widget for shift communication.
-   **Quick Access**: Tabbed interface for Documents, Events, Maintenance, and Changes (ECOs).
-   **Dialogs**:

### 5.3 Work Order Details (`WorkOrderDetailsPage.tsx`)
*To be documented*

## 6. Forms & Dialogs
Interactive dialogs for data entry.

### 6.1 Create Work Order (`CreateWorkOrderDialog.tsx`)
A multi-step wizard for creating maintenance work orders.
-   **Steps**:
    1.  **Triage & Context**: Select machine, work order type (PM, CM, etc.), and priority.
    2.  **Details & Schedule**: Title, description, due date, and assignment.
    3.  **Resources**: Add tasks, parts required, and link to ECOs/Events.
    4.  **Review**: Summary of all entered data before submission.
-   **Features**:
    -   Prefills data if triggered from an ECO or Machine context.
    -   Validation at each step.
    -   Toast notification with "View" action upon success.

### 6.2 Log Event (`LogEventDialog.tsx`)
A wizard for logging machine events (downtime, faults, etc.).
-   **Steps**:
    1.  **Triage**: Select machine, event type, and severity.
    2.  **Details**: Time range, description, root cause, and resolution.
    3.  **Impact**: Quantify impact (units affected, scrap, downtime), add evidence files, and link to ECOs/WOs.
    4.  **Review**: Verify data.
-   **Features**:
    -   Calculates duration automatically.
    -   Allows file attachments for evidence.

### 6.3 Create ECO (`CreateECODialog.tsx`)
Standard dialog for initiating an Engineering Change Order.
-   **Fields**: Machine selection, ECO Number, Title, Type (Software/Hardware/Process), Reason, Description, Effective Date, Rollback Plan.
-   **Mod Sheet**: Integrated form for defining mechanical and electrical modification details.
-   **Features**:
    -   Context-aware machine selection.
    -   Validation for required fields.

### 6.4 Upload Document (`UploadDocumentDialog.tsx`)
Dialog for uploading machine-related documents.
-   **Fields**: Machine selection, Document Type (Backup/Manual/Drawing), File selection, Version/Revision, Controller (for backups), Release State.
-   **Relationships**: Option to link to specific ECOs or Components.
-   **Features**:
    -   Auto-populates name from filename.
    -   Type-specific fields (e.g., "Controller" only for Backups).

## 7. Data Models
Core entities defined in `src/types/green-room.ts`.

### Machine
Represents a physical asset on the floor.
-   **Key Fields**: `id`, `name`, `status` (active/down/maint), `category`, `oee`, `mtbf`, `mttr`.
-   **Location**: `x`, `y` coordinates for floor map.

### WorkOrder
A maintenance or engineering task.
-   **Key Fields**: `id`, `title`, `status` (open/in-progress/etc), `priority`, `type` (PM/CM), `dueDate`, `tasks` (list), `partsUsed`.
-   **Links**: `machineId`, `linkedEventId`, `linkedECO`.

### ECO (Engineering Change Order)
A change management record.
-   **Key Fields**: `id`, `number`, `title`, `status` (draft/review/approved/effective), `type`, `reason`, `modSheet` (detailed specs).
-   **Links**: `machineId`, `impactedComponents`.

### Event
A distinct occurrence on a machine.
-   **Key Fields**: `id`, `type` (fault/downtime/etc), `description`, `timestamp`.
-   **Links**: `machineId`.

### Document
A file associated with a machine.
-   **Key Fields**: `id`, `type`, `name`, `fileUrl`, `version`, `releaseState`.
-   **Links**: `machineId`, `linkedECO`.

### ShippingOrder
An outbound order.
-   **Key Fields**: `id`, `orderNumber`, `status` (pending/shipped/etc), `items`, `dueDate`.

### Delivery
Inbound or outbound logistics event.
-   **Key Fields**: `id`, `carrier`, `status`, `scheduledDate`, `dock`.
