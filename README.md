# Unfazed — SaaS Platform for Private Practice Therapists in India

Unfazed is an end-to-end clinical practice management platform and client acquisition hub. A therapist gets a single branded public link (e.g., `unfazed.in/dr-sharma`) to handle client booking, intake, consent, payments, and messaging, backed by a clinical management workspace.

---

## 🌟 Key Architecture & Modules Implemented

1. **Module 1: Foundations — Auth, Profile & Branded Link**
   - JWT authentication (`bcryptjs`, `jsonwebtoken`).
   - Dynamic URL-safe unique slug generation (`unfazed.in/dr-sharma`).
   - Branded public landing page displaying specializations, bio, qualifications, and rates.

2. **Module 2: Scheduling System**
   - Configurable weekly availability matrix with custom buffer times (10/15/30 min) and session duration options (45/60/90 min).
   - Timezone-converted discrete slot generator.
   - **Double-booking prevention**: Strict database-level overlap guards ensuring instantaneous confirmation.

3. **Module 3: Client CRM & Intake Compliance**
   - Patient CRM list with multi-parameter search, status filtering, and clinical tags.
   - Individual client profile aggregating session history, payment history, and clinical notes.
   - Standardized intake data capture + digital telehealth consent agreement with auditable timestamp.

4. **Module 4: Payments & Packages**
   - Razorpay test integration for advance payment at the time of booking.
   - Multi-session continuity packages (3, 6, 12 sessions) with validity tracking.
   - **PDF Tax Invoice**: Auto-generated GST-compliant invoice using `pdfkit` available for instant download.

5. **Module 5: Clinical Documentation & Access Firewall**
   - Role-restricted clinical data separation.
   - **Strict Firewall**: Client-facing endpoints explicitly filter only `type: 'shared'`, guaranteeing confidential clinician notes remain 100% inaccessible to clients.
   - Structured **SOAP Notes** (Subjective, Objective, Assessment, Plan) and Freeform clinical editor.

6. **Module 6: Communication (Chat + Notifications)**
   - Real-time in-app encrypted messaging using **Socket.io** with room isolation, typing indicators, and delivery receipts.
   - Event-driven **NotificationService**: Logs and queues domain event notifications (booking confirmed, 24hr reminder, post-session follow-up) with a stubbed WhatsApp business queue and Nodemailer email dispatch.

7. **Module 7: Subscription Tiers, Entitlements & Aggregation Analytics**
   - **Centralized Entitlement Service**: Feature gating driven by configuration (`canAccess(therapistId, featureKey)`). Never checks tier strings directly.
   - Interactive Upgrade Prompt Modal when hitting plan limits (Free = 5 active clients, Growth = 25 clients + SOAP notes + packages, Pro = unlimited + advanced depth).
   - **MongoDB Aggregation Pipelines**: Real server-side aggregation pipelines computing monthly gross revenue trends, no-show rates, completion rates, and client retention.

---