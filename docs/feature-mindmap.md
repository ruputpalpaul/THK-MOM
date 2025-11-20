# Feature Mind Map

This document outlines the core features of the application, specifically focusing on forms, dialogs, and data entry points. It maps out the purpose, input fields, and relationships for each component to aid in the UX overhaul and future development.

## 1. Machine Management

### 1.1 Edit Machine Details
- **Location**: `MachineDetailsPage` (Edit button)
- **Purpose**: Modify core properties of a machine.
- **Fields**:
  - `Name` (Text)
  - `Type` (Text)
  - `Category` (Text)
  - `Status` (Select: active, maintenance, down)
  - `Criticality` (Select: low, medium, high)
  - `OEM` (Text)
  - `Controller` (Text)
  - `Commissioned Date` (Date)
  - `Last Backup` (Date)
  - `Power` (Text)
  - `Air` (Text)
  - `Network` (Text)
  - `KPI Targets`: Today Target, Today Actual, Today Scrap, MTBF, MTTR, OEE.
  - `Down Reason` (Text - if status is down)
- **API**: `updateMachine`

### 1.2 Change Machine Status
- **Location**: `UniversalMachineSidebar` (Change Status button)
- **Purpose**: Quickly update machine operational status.
- **Fields**:
  - `Status` (Select: active, maintenance, down)
  - `Downtime Reason` (Text Area - required if down)
- **API**: `updateMachine`

### 1.3 Upload Document
- **Location**: `UploadDocumentDialog`
- **Purpose**: Upload and associate manuals, backups, or drawings with a machine.
- **Fields**:
  - `Machine` (Select)
  - `Document Type` (Select: Program Backup, Operator Manual, Drawings)
  - `Name` (Text)
  - `Version` (Text)
  - `Revision` (Text)
  - `Controller` (Text)
  - `Notes` (Text Area)
  - `Created By` (Text)
  - `Approved By` (Text)
  - `Release State` (Select: draft, approved)
  - `Effective From` (Date)
  - `Supersedes` (Text)
  - `Linked ECO` (Select)
  - `Linked Components` (Multi-select)
  - `Part Numbers` (List)
- **API**: `createDocument` (implied)

### 1.4 Add Note
- **Location**: `AddNoteDialog`
- **Purpose**: Attach free-text notes to a machine for collaboration.
- **Fields**:
  - `Machine` (Select)
  - `Title` (Text)
  - `Content` (Text Area)
  - `Category` (Text)
  - `Priority` (Select: low, medium, high)
  - `Author` (Text)
  - `Linked ECO` (Select)
  - `Rollback Plan` (Text Area)
  - **Embedded Form**: `ModSheetForm` (see below)
- **API**: `createECO` (implied)

### 3.2 Modification Sheet (ModSheet)
- **Location**: Embedded in `CreateECODialog` / `ECODetailsPage`
- **Purpose**: Detailed engineering specifications for the change.
- **Sections**:
  - **Requestor**: Receipt No, Date, Machine Name/No, Park Link Rail Mod (Y/N), Control Plan Update (Y/N), PFMEA Update (Y/N), Due Date, Requested By, Confirmed By.
  - **Mechanical**: Description, Print No, Design Location, Install Location, Test Type, Consumables/Software, Component Cost, Notes.
  - **Electrical**: Description, Print No, Design Location, Install Location, Test Type, PLC Backup, Component Cost, Notes.
  - **Documentation**: Total Cost, Hours, Notes.
  - **Approvals**: Prepared By, Confirmed By, Checked By, Engineer, Engineer Date.

## 4. Administration

### 4.1 Manage User Access
- **Location**: `ManageAccessDialog`
- **Purpose**: Assign roles to users.
- **Fields**:
  - `User Role` (Select: admin, supervisor, operator, engineer, viewer) per user.
- **API**: `updateUserRole`

## 5. Shipping (Read-Only / Status Updates)

### 5.1 Shipping Order Details
- **Location**: `ShippingOrderDetailsPage`
- **Purpose**: View and track shipping orders.
- **Actions**:
  - `Mark as Packed` (Button)
  - `Mark as Shipped` (Button)
- **Note**: Currently appears to be action-driven rather than form-driven.

## 6. Dashboards & Views

### 6.1 Fabrication & Green Room Dashboards
- **Location**: `FabricationDashboard.tsx`, `GreenRoomDashboard.tsx`
- **Purpose**: Operational overview for specific plant areas.
- **Key Features**:
  - **Status Tiles**: Quick stats for Total/Active Machines, Pending Work Orders, ECOs in Review, Old Backups.
  - **Floor Map**: Visual representation of machine status (Active, Down, Maintenance).
  - **Line Utilization**: Bar charts showing target vs. actual performance per category.
  - **Machine Sections**: Accordion view of machines grouped by category with status badges.
  - **Shift Handoff Notes**: (Fabrication only) Pinned/Unpinned notes for shift communication.
- **Quick Access Tabs**:
  - `Documents`: Filterable list of Program Backups, Manuals, Drawings.
  - `Events`: Recent machine events log.
  - `Maintenance`: List of open work orders.
  - `Changes`: List of active ECOs.

### 6.2 Shipping Dashboard
- **Location**: `ShippingDashboard.tsx`
- **Purpose**: Manage shipping logistics, orders, and dock schedules.
- **Key Features**:
  - **Summary Metrics**: Open Orders, Today's Deliveries, Ready Orders, On-time Ship %, Pick Rate, Aging Orders.
  - **Equipment Status**: Monitoring of Wrap/Pack machines and Forklifts.
  - **Inventory Snapshot**: Availability of top SKUs.
  - **Dock Calendar**: Schedule of arriving/departing deliveries.
- **Tabs**:
  - `Orders`: Filter by status (Picking, Packed, Shipped) and search.
  - `Deliveries`: Daily and calendar view of dock appointments.
  - `Parts Readiness`: Track part availability per order.

### 6.3 Machine Area Board
- **Location**: `MachineAreaBoard.tsx`
- **Purpose**: Administrative tool to assign machines to specific plant areas (Green Room, Fabrication, Shipping).
- **Features**:
  - Drag-and-drop or Select-based assignment.
  - Filtering by unassigned machines.

### 6.4 Global Search
- **Location**: `GlobalSearch.tsx`
- **Purpose**: System-wide omnibox for finding any entity.
- **Scope**:
  - Machines (ID, Name, Serial)
  - Documents (Name, Type)
  - Work Orders (ID, Description)
  - Events (Description, Code)
  - ECOs (Number, Title)

### 6.5 Detail Pages (View Mode)
- **Machine Details**: `MachineDetailsPage.tsx` - Comprehensive hub for a single machine (Docs, Components, Settings, Timeline).
- **Work Order Details**: `WorkOrderDetailsPage.tsx` - Task checklist, parts usage, and timeline for a specific job.
- **ECO Details**: `ECODetailsPage.tsx` - Approval workflow visualization, impacted items list, and modification sheet view.

