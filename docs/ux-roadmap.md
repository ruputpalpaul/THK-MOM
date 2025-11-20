# UX Overhaul Roadmap

## 1. Executive Summary
This roadmap outlines a strategic plan to enhance the THK-MOM application's user experience. The goal is to transition from a "feature-based" UI to a "persona-based" workflow, specifically optimizing for **Operators** (efficiency, clarity, step-by-step guidance) and **Supervisors** (hierarchy, drill-down capabilities, data organization).

## 2. Persona-Based Analysis & Recommendations

### 2.1 The Operator: "Guide Me"
**Current State**: Operators face large, monolithic forms (e.g., `CreateWorkOrderDialog`, `LogEventDialog`) that require significant cognitive load. Optional fields clutter the view, and relationships (e.g., linking an ECO) are hidden at the bottom.
**Goal**: Streamline data entry, reduce errors, and provide clear "next steps."

#### Recommendations:
1.  **Wizard-Style Dialogs**:
    *   Convert `CreateWorkOrderDialog` and `LogEventDialog` into multi-step wizards.
    *   **Step 1: Context**: Select Machine (if not already selected), Type, and Priority.
    *   **Step 2: Details**: Description, Time, and core data.
    *   **Step 3: Resources/Impact**: Parts, Tasks, or Impact metrics (optional step).
    *   **Step 4: Review**: Summary before submission.
2.  **Context-Aware Quick Actions**:
    *   Instead of a generic "Log Event" button, offer specific actions like "Report Downtime" or "Request Maintenance" that pre-fill the Event Type and Severity.
3.  **Smart Defaults**:
    *   If an Operator is assigned to a specific machine or area, pre-select those values.
    *   Hide "Advanced" fields (e.g., Root Cause Analysis, Linked ECOs) behind an "Advanced Details" toggle unless relevant.

### 2.2 The Supervisor: "Show Me What Matters"
**Current State**: Dashboards (`Home`, `ProductionOverview`) present a lot of data but lack deep interactivity. Navigation can be redundant (Home -> Production -> Area).
**Goal**: Improve information hierarchy and enable "management by exception."

#### Recommendations:
1.  **Dashboard Consolidation**:
    *   Merge `HomeDashboard` and `ProductionOverviewDashboard` concepts.
    *   **Executive View**: High-level KPIs (Uptime, OEE, Plan Attainment).
    *   **Operational View**: A unified "Plant Floor" view that aggregates Fabrication, Green Room, and Shipping status in a single, dense grid or list, allowing quick comparison.
2.  **Actionable Metrics**:
    *   Make KPI cards clickable. Clicking "5 Down Machines" should immediately open a filtered list or side-panel showing *which* 5 machines are down, rather than just navigating to a general area.
3.  **Navigation Restructuring**:
    *   Group operational areas under a **"Plant Floor"** section.
    *   Group planning and analysis tools under a **"Management"** section (Machine Planner, Tool Life, Analytics).

## 3. Proposed Architecture Changes

### 3.1 Navigation Hierarchy
```text
- Dashboard (Home)
- Plant Floor
  ├─ All Areas (Production Overview)
  ├─ Fabrication
  ├─ Green Room (Assembly)
  └─ Shipping
- Management
  ├─ Machine Planner
  ├─ Tool Life & Analytics
  └─ User Access (Admin only)
```

### 3.2 Component Refactoring
*   **`WizardDialog` Component**: A reusable wrapper for multi-step forms to ensure consistency across Work Orders, Events, and ECOs.
*   **`DrillDownCard` Component**: A dashboard card that expands or opens a drawer with detailed lists instead of navigating away.
*   **`ContextSidebar`**: Enhance the existing `UniversalMachineSidebar` to be the primary "Action Center" for operators, reducing the need to open full-screen dialogs for simple tasks.

## 4. Implementation Phases

### Phase 1: Operator Efficiency (High Impact)
*   [ ] Refactor `CreateWorkOrderDialog` into a 3-step wizard.
*   [ ] Refactor `LogEventDialog` into a 3-step wizard.
*   [ ] Implement "Smart Defaults" for form fields.

### Phase 2: Supervisor Insights
*   [ ] Reorganize Sidebar Navigation to match the new hierarchy.
*   [ ] Update `HomeDashboard` to support drill-down interactions (clicking a stat opens a detail drawer).
*   [ ] Consolidate `ProductionOverview` into the main navigation flow.

### Phase 3: Visual Polish & Feedback
*   [ ] Add progress indicators to wizards.
*   [ ] Implement "Toast" notifications with "Undo" actions where possible.
*   [ ] Add empty states and helpful tooltips for complex fields.
