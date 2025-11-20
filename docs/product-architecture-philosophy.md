# Product Architecture Philosophy: The THK-MOM Suite

**Version:** 1.0
**Author:** Chief Software Architect
**Date:** November 2025

---

## 1. The Vision: "Tools, Not Toys"

The THK-MOM (Manufacturing Operations Management) Suite is not just a collection of web pages; it is a **digital power tool** for the factory floor.

Operators and engineers do not "browse" our software; they **wield** it to accomplish physical tasks. Every second spent fighting a UI or waiting for a spinner is a second stolen from production. Therefore, our guiding philosophy is **Reliability, Clarity, and Speed**.

We are building a **Unified Operational Nervous System**—a suite of applications that share a brain (data), a heart (auth/identity), and a language (UX).

## 2. The Nature of Factory Software

Factory environments are hostile to fragile software. We must design for:
*   **The "Dirty Hands" Reality**: Interfaces must be hit targets, not pixel-perfect clicks. Touchscreens are often resistive, greasy, or used with gloves.
*   **The "Network Shadow"**: Wi-Fi on a factory floor is notoriously spotty due to metal interference. The app cannot die just because a packet dropped.
*   **The "Audit" Imperative**: In manufacturing, *who* did *what* and *when* is a legal and safety requirement, not just a logging detail.

## 3. Pitfalls to Avoid

### 3.1. The "Happy Path" Fallacy
**Pitfall**: Designing only for when the server is up, the internet is fast, and the user inputs valid data.
**Reality**: Servers crash, forklifts run over fiber cables, and tired operators type "1000" instead of "10.00".
**Solution**: Defensive coding, robust error boundaries, and validation at the edge.

### 3.2. Data Silos (The "Excel" Trap)
**Pitfall**: Building separate apps for Maintenance, Quality, and Production that don't talk to each other.
**Reality**: A machine down for maintenance (Maintenance App) means production capacity is zero (Production App).
**Solution**: A single, unified data model. No data is "owned" by an app; it is owned by the Suite.

### 3.3. Alert Fatigue
**Pitfall**: Bombarding users with every possible notification.
**Reality**: If everything is urgent, nothing is urgent. Users will ignore safety warnings if they are buried in "printer toner low" alerts.
**Solution**: Intelligent, context-aware escalation policies.

## 4. The Architecture: "The Iron Core"

To achieve stability, data integrity, and seamlessness, we will move from independent client-side apps to a **Server-Centric, Client-Optimized** architecture.

### 4.1. The Backend: The "Monolith of Truth"
We will avoid the complexity of microservices until scale demands it.
*   **Structure**: A Modular Monolith. Distinct domains (Auth, Inventory, Maintenance, Production) living in a single deployable unit to ensure consistency.
*   **Language**: Strongly typed (e.g., Node.js/TypeScript or Go) to mirror our frontend types.
*   **API Layer**: GraphQL or tRPC. Why? Because we need to fetch complex, nested relationships (Machine -> Active Work Order -> Parts -> Inventory Status) in a single round trip to save bandwidth.

### 4.2. Data Strategy: Event Sourcing Lite
Traditional CRUD (Create, Read, Update, Delete) destroys history. Overwriting a status from "Running" to "Down" erases the fact that it *was* running.
*   **Approach**: We record **Events** (e.g., `MachineStatusChanged`, `WorkOrderCreated`). The current state is a projection of these events.
*   **Benefit**: Perfect audit trails. We can replay history to see exactly what happened during a shift.
*   **Database**: PostgreSQL for relational integrity. JSONB columns for flexible sensor data payloads.

### 4.3. The Frontend: "Optimistic & Resilient"
*   **Optimistic UI**: When an operator clicks "Start Job", the UI updates *instantly*. We send the request in the background. If it fails, we roll back and notify. We never block the user.
*   **Offline-First Capabilities**: Critical flows (like "Emergency Stop" logging or "Checklist Completion") must work without a connection. We use local storage/IndexedDB to buffer actions and sync when the connection returns.
*   **State Management**: A global store (e.g., Zustand or Redux Toolkit) that mirrors the server state, synchronized via WebSockets for real-time "Andon" board updates.

### 4.4. Identity & Security: "The Keycard"
*   **Unified SSO**: One login for the entire suite. An operator signs in once at the start of the shift.
*   **RBAC (Role-Based Access Control)**: Granular permissions. A "Junior Operator" can *view* a recipe; a "Supervisor" can *edit* it. This is enforced at the API level, not just the UI.

## 5. "The Suite" Concept

We are not building "apps"; we are building **Modules** of a single platform.

*   **Shared Design System**: A button in the "Quality" module looks and behaves exactly like a button in the "Shipping" module. (We are already doing this with our UI components).
*   **Unified Context**: If I select "Machine A" in the Dashboard, and then switch to the "Maintenance" module, "Machine A" should still be selected. Don't make me find it again.
*   **Cross-Module Linking**: A "Quality Alert" in the Inspection module should directly link to a "Work Order" in the Maintenance module.

## 6. Summary for the Team

1.  **Trust the Server**: It is the source of truth.
2.  **Empower the Client**: It must be fast and resilient.
3.  **Respect the User**: Their time is money. Don't waste it.
4.  **Connect Everything**: Data is the lifeblood; let it flow.

*Signed,*
*Antigravity*
*System Architect*
