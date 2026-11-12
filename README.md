# Unified Medical Records Access Platform

A centralized platform that enables authorized doctors to access and view a patient's medical records from multiple connected hospitals through a single dashboard.

## Live Demo

- **Frontend:** [Unified Medical Records Platform](https://unified-medical-records-platform-fr.vercel.app/)
- **Backend API:** [Render Backend](https://unified-medical-records-platform.onrender.com/)
- **API Health Check:** [Backend Status](https://unified-medical-records-platform.onrender.com/api/health)

## Problem

Patient medical records are often scattered across different hospitals and diagnostic centres. This makes it difficult for doctors to access a patient's complete medical history, leading to delays, repeated tests, and incomplete clinical information.

## Solution

The platform connects multiple hospital APIs and brings their medical records together in one unified dashboard. Doctors can search for patients using fictional ABHA-style IDs and view their combined medical history.

## Key Features

- **Role-Based Authentication:** Separate access for Doctors and Hospital Administrators.
- **Patient Search:** Search patients using demo ABHA-style IDs.
- **Multi-Hospital Integration:** Retrieve records from multiple independent hospital APIs.
- **Unified Medical Timeline:** View records chronologically or filter by hospital and report type.
- **Hospital Management:** Register hospitals and manage their API connectivity.
- **Outage Simulation:** Simulate hospital downtime while retrieving records from available hospitals.
- **Audit Logs:** Track patient searches, record retrievals, and system activities.
- **Expandable Records:** Inspect report metadata, vitals, laboratory results, medications, and summaries.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS |
| Backend | Node.js, Express.js, REST APIs |
| Authentication | Local Demo Authentication (HMAC-SHA256, JWT-style tokens) |
| Data Storage | Local JSON Demo Store |
| Testing | Node.js Test Runner |
| Deployment | Vercel, Render |

## System Architecture

```text
Doctor / Hospital Admin
          |
          v
    React Frontend
       (Vercel)
          |
          v
    Express Backend
       (Render)
          |
    -----------------
    |       |       |
 Sunrise CityCare Aarogya
 Hospital Hospital Hospital
    |       |       |
    -----------------
          |
          v
  Unified Medical Records
          |
          v
   Medical History Timeline
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Doctor | doctor@unifiedhealth.demo | DemoDoctor@123 |
| Hospital Admin | admin@unifiedhealth.demo | DemoAdmin@123 |

**Sample Patient ID:** `DEMO-ABHA-1001`

All credentials and patient information are for demonstration purposes only.

## Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/iamshravanijadhav/unified-medical-records-platform.git
cd unified-medical-records-platform
```

**2. Start the backend**

```bash
cd backend
npm install
npm start
```

**3. Start the frontend** (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Testing

Run backend integration tests:

```bash
cd backend
npm test
```

**Verified Result:** 12/12 automated tests passed.

The tests cover authentication, role-based access, patient lookup, hospital APIs, multi-hospital retrieval, outage handling, and audit logging.

## Project Limitations

- Uses synthetic patient records and fictional ABHA-style identifiers.
- Hospital APIs are simulated demo endpoints, not live hospital systems.
- Not connected to live ABDM infrastructure or real patient databases.
- Firebase integration is optional and is not required for the current Local Demo Mode.
- Not intended for real clinical diagnosis or treatment.

## Future Scope

- Integration with live ABDM infrastructure.
- HL7 FHIR R4-based data exchange.
- Real hospital HIS and diagnostic system integrations.
- Enhanced security, patient authorization, and privacy workflows.

---

**Disclaimer:** This is an educational college MVP developed for demonstration purposes. It does not use real patient data and is not intended for actual clinical use.
