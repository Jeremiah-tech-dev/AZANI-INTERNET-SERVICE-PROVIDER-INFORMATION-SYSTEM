# AZANI INTERNET SERVICE PROVIDER INFORMATION SYSTEM
## System Documentation

---

**School:** Njoro Day Secondary School
**Candidate Name:** Maria Goretti Cherotich
**Subject:** Computer Studies

---

## TABLE OF CONTENTS

1. Introduction
2. System Overview
3. System Requirements
4. System Architecture
5. Database Design
6. System Features & Modules
7. User Roles
8. Computations & Business Logic
9. Reports Generated
10. System Deployment
11. System Testing
12. Important Notice — Live System & Admin Access
13. Conclusion

---

## 1. INTRODUCTION

### 1.1 Background

Azani is a company that specializes in the provision of internet services and internet infrastructure to learning institutions. The institutions served include primary schools, junior schools, senior schools, and colleges. As the company grew, the need for an organized, automated, and reliable information system became critical — one that could manage institution registrations, track payments, compute charges, and generate meaningful reports.

### 1.2 Problem Statement

Before this system was developed, Azani managed all its operations manually — using paper records and spreadsheets. This led to:

- Delayed payment tracking
- Errors in computing overdue fines and reconnection fees
- Difficulty in identifying defaulters
- Inability to generate real-time reports on institution status
- Poor management of bandwidth upgrade requests

### 1.3 Objectives

The main objectives of this system are to:

1. Register institutions and capture their contact details
2. Capture all payment types — registration, installation, and monthly fees
3. Generate lists of registered institutions, defaulters, and disconnected services
4. Perform all required financial computations automatically
5. Generate comprehensive management reports

---

## 2. SYSTEM OVERVIEW

The Azani ISP Information System is a **web-based database management system** built to fully automate the operations of Azani Company. The system provides two distinct portals:

- **Admin Portal** — Used by Azani staff to manage institutions, review payments, activate accounts, view reports, and manage bandwidth orders
- **Institution Portal** — Used by registered institutions to view their service status, submit payments, manage infrastructure details, and request bandwidth upgrades

### 2.1 Key Highlights

| Feature | Details |
|---|---|
| Platform | Web Application |
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas — Cloud) |
| Authentication | JWT (JSON Web Tokens) |
| Payment Integration | M-Pesa Daraja API (STK Push) |
| Hosting | Render.com (Frontend + Backend) |
| Live URL | https://azani-frontend.onrender.com |

---

## 3. SYSTEM REQUIREMENTS

### 3.1 Functional Requirements

The system is required to perform the following tasks:

**a) Institution Registration**
- Register institutions with: institution name, institution type, contact person name, email address, and phone number
- Supported institution types: Primary, Junior, Senior, College

**b) Payment Capture**
- Registration fee: KSh 8,500
- Installation fee: KSh 10,000 (for institutions ready for connectivity)
- Monthly payments based on selected bandwidth package

**c) List Generation**
- List of all registered institutions
- List of defaulters (institutions with unpaid monthly bills)
- List of institutions with disconnection issues
- Infrastructure details for each institution

**d) Computations**
- Total installation cost per institution (installation fee + computers + LAN)
- Cost of personal computers (KSh 40,000 each) and LAN nodes (tiered pricing)
- Monthly charges for upgraded internet services (10% discount on upgrades)
- Overdue fines (15% of monthly fee) and reconnection fees (KSh 1,000)
- Aggregate amounts per service sorted by institution

**e) Report Generation**
- Summary reports grouped by institution type
- Revenue totals from monthly fees, fines, and reconnection fees

### 3.2 Non-Functional Requirements

| Requirement | Description |
|---|---|
| Security | Passwords hashed using bcrypt; sessions managed via JWT tokens |
| Availability | System hosted on cloud — accessible 24/7 from any browser |
| Usability | Responsive design; works on desktop, tablet, and mobile |
| Reliability | MongoDB Atlas ensures data backup and high availability |
| Scalability | Cloud-hosted backend can scale on demand |

---

## 4. SYSTEM ARCHITECTURE

The system follows a **3-Tier Architecture**:

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│         React.js (Frontend)             │
│   azani-frontend.onrender.com           │
└────────────────┬────────────────────────┘
                 │ HTTPS API Calls
┌────────────────▼────────────────────────┐
│           APPLICATION LAYER             │
│      Node.js + Express.js (Backend)     │
│      azani-server.onrender.com          │
│                                         │
│  Routes: /auth /institution /dashboard  │
│          /orders /payments              │
└────────────────┬────────────────────────┘
                 │ Mongoose ODM
┌────────────────▼────────────────────────┐
│             DATA LAYER                  │
│       MongoDB Atlas (Cloud DB)          │
│       Region: AWS af-south-1            │
│       Collections: institutions,        │
│                    payments, orders     │
└─────────────────────────────────────────┘
```

---

## 5. DATABASE DESIGN

### 5.1 Institution Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique identifier |
| role | String | 'admin' or 'institution' |
| institutionName | String | Name of the institution |
| institutionType | String | primary / junior / senior / college |
| contactPersonName | String | Name of the contact person |
| email | String | Unique login email |
| phoneNumber | String | Contact phone number |
| password | String | Hashed password (bcrypt) |
| registrationFeePaid | Boolean | Whether KSh 8,500 has been paid |
| installationFeePaid | Boolean | Whether KSh 10,000 has been paid |
| monthlyFeePaid | Boolean | Whether current month's bill is paid |
| currentBandwidth | String | Active bandwidth: 4/10/20/25/50 MBPS |
| serviceActive | Boolean | Whether internet service is active |
| needsReconnection | Boolean | Whether reconnection fee is pending |
| numberOfUsers | Number | Total internet users |
| computersPurchased | Number | Computers bought from Azani |
| lanNodesPurchased | Number | LAN nodes purchased |
| hasLAN | Boolean | Whether institution has existing LAN |
| isReadyForConnectivity | Boolean | Whether ready for installation |
| currentMonth | String | Last paid billing month (e.g. 2025-07) |
| disconnectedAt | Date | When service was disconnected |

### 5.2 Payment Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique identifier |
| institution | ObjectId | Reference to Institution |
| institutionName | String | Denormalized name for reports |
| type | String | registration / installation / monthly / reconnection |
| amount | Number | Amount paid in KSh |
| month | String | Billing month (for monthly payments) |
| method | String | cash or mpesa |
| reference | String | Optional reference (e.g. 'overdue-fine') |
| createdAt | Date | Payment timestamp |

### 5.3 Order Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique identifier |
| institution | ObjectId | Reference to Institution |
| bandwidth | String | Requested bandwidth (MBPS) |
| monthlyFee | Number | Standard fee |
| discountedFee | Number | Fee after 10% upgrade discount |
| currentBandwidth | String | Current bandwidth before upgrade |
| status | String | pending / contacted / visited / installed |
| read | Boolean | Whether admin has viewed the order |

---

## 6. SYSTEM FEATURES & MODULES

### 6.1 Authentication Module

- **Registration** — New institutions register with full details. Passwords must meet security requirements (uppercase, lowercase, number, special character, minimum 8 characters)
- **Login** — Email and password authentication with JWT token issued on success
- **Role-based Access** — Admin users are redirected to the Admin Dashboard; institution users to the Institution Portal
- **Visual Feedback** — Full-screen loading overlay appears on login/registration. Success and error toast notifications inform the user of the outcome

### 6.2 Admin Dashboard

The admin dashboard provides a comprehensive overview of all system data:

**Overview Tab**
- Animated stat cards showing: Total Institutions, Active Services, Defaulters, Monthly Revenue
- Bandwidth distribution chart
- Institution type breakdown
- Recent registrations with activation controls

**Institutions Tab**
- Full list of all registered institutions with their type, contact details, bandwidth, and service status

**Payments Tab**
- All institution payment records showing registration fees, installation fees, monthly fees, overdue fines, and reconnection fees
- "View Ledger" button to see the complete payment history of any institution

**Services Tab**
- Aggregate service view sorted alphabetically by institution name
- Shows registration, installation, and monthly payment status per institution

**Defaulters Tab**
- Lists all active institutions that have not paid their monthly bill
- Shows monthly fee, 15% overdue fine, and total amount due

**Disconnections Tab**
- Lists all disconnected institutions with reconnection fee status and disconnection date

**Infrastructure Tab**
- Per-institution breakdown of: number of users, computers purchased, computer cost, LAN nodes, LAN cost, LAN status, and connectivity readiness

**Reports Tab**
- Summary grouped by institution type showing:
  - Count of institutions
  - Total monthly charges
  - Total overdue fines
  - Total reconnection fees
  - Grand total per category
- Overall installation revenue and upgrade revenue summaries

**Notifications Panel**
- Bell icon with unread badge shows bandwidth upgrade orders from institutions
- Admin can track each order through: Pending → Contacted → Visited → Installed

### 6.3 Institution Portal

**My Dashboard**
- Welcome hero banner
- Account status cards (bandwidth, monthly fee, computers, LAN nodes)
- Account status panel (registration, installation, service active/inactive)
- Important notices (payment deadlines, overdue fines, disconnection policy, reconnection fee)
- Bandwidth upgrade panel with 10% discount on upgrades

**My Service Tab**
- Displays current bandwidth, service status, monthly fee, and infrastructure summary

**Payments Tab**
- Summary cards for all fee types with paid/unpaid status
- Action buttons to pay Monthly Fee, Installation Fee, or Reconnection Fee via Cash or M-Pesa STK Push
- Complete payment history ledger showing all past transactions

**Infrastructure Tab**
- Editable form for number of users, computers, LAN nodes, LAN status, and connectivity readiness
- Real-time cost calculator for computers and LAN nodes

**Profile Tab**
- Displays institution details and contact person information

**Support Tab**
- Contact information and office hours for Azani support team

---

## 7. USER ROLES

### 7.1 Admin User

| Capability | Description |
|---|---|
| View all institutions | Full list with all details |
| Activate accounts | Mark registration as paid and activate service |
| View payment records | See all fees and ledgers per institution |
| Manage disconnections | View institutions with disconnection issues |
| Handle bandwidth orders | Track agent visit status from pending to installed |
| Generate reports | View revenue summaries by institution type |

**Admin Credentials:**
- Email: admin@azani.co.ke
- Password: Azani@Admin2026!

### 7.2 Institution User

| Capability | Description |
|---|---|
| Register account | Self-registration with institution details |
| Pay registration fee | KSh 8,500 via Cash or M-Pesa |
| View service status | Current bandwidth and account standing |
| Update infrastructure | Submit users, computers, LAN information |
| Pay monthly bill | With automatic overdue fine if applicable |
| Pay installation fee | KSh 10,000 when ready for connectivity |
| Pay reconnection fee | KSh 1,000 after disconnection |
| Order bandwidth upgrade | Select new package with 10% discount |

---

## 8. COMPUTATIONS & BUSINESS LOGIC

### 8.1 Bandwidth Pricing (Table 1)

| Bandwidth | Monthly Cost (KSh) |
|---|---|
| 4 MBPS | 1,200 |
| 10 MBPS | 2,000 |
| 20 MBPS | 3,500 |
| 25 MBPS | 4,000 |
| 50 MBPS | 7,000 |

### 8.2 LAN Node Pricing (Table 2)

| Number of Nodes | Cost (KSh) |
|---|---|
| 2 – 10 | 10,000 |
| 11 – 20 | 20,000 |
| 21 – 40 | 30,000 |
| 41 – 100 | 40,000 |

### 8.3 Computer Cost
```
Computer Cost = Number of Computers × KSh 40,000
```

### 8.4 Total Installation Cost
```
Total Installation = Installation Fee (KSh 10,000)
                   + Computer Cost (units × 40,000)
                   + LAN Node Cost (tiered)
```

### 8.5 Bandwidth Upgrade Discount
```
Discounted Fee = Standard Monthly Fee × 0.90   (10% off)
Condition: Only applied when upgrading to a HIGHER bandwidth
```

### 8.6 Overdue Fine
```
Overdue Fine = Monthly Fee × 0.15   (15%)
Condition: Applied when monthly fee is not paid for the previous billing month
```

### 8.7 Automatic Disconnection (Billing Cycle)
```
1st of every month  → Monthly fee status reset to "unpaid" for all active institutions
10th of every month → Institutions that have NOT paid for the previous month are:
                      - Disconnected (serviceActive = false)
                      - Flagged for reconnection (needsReconnection = true)
                      - Timestamped with disconnection date
```

### 8.8 Reconnection Fee
```
Reconnection Fee = KSh 1,000
Condition: Paid after the monthly bill + overdue fine are settled
Effect: Restores serviceActive = true, clears needsReconnection flag
```

### 8.9 Aggregate Amount Per Institution
```
Total Due = Monthly Fee + Overdue Fine (if applicable) + Reconnection Fee (if applicable)
```

---

## 9. REPORTS GENERATED

### 9.1 Registered Institutions Report
A tabular list of all institutions with their name, type, contact person, email, phone, bandwidth, registration status, and service status.

### 9.2 Defaulters Report
Lists all active institutions that have an unpaid monthly bill, showing:
- Institution name and type
- Email and phone
- Current bandwidth
- Monthly fee amount
- Overdue fine (15%)
- Total amount due

### 9.3 Disconnections Report
Lists all institutions whose service has been disconnected, showing:
- Institution name and type
- Last known bandwidth
- Reconnection fee (KSh 1,000)
- Whether reconnection fee has been paid
- Date of disconnection

### 9.4 Infrastructure Report
Per-institution breakdown showing:
- Number of internet users
- Computers purchased from Azani and their cost
- LAN nodes purchased and their cost
- Whether the institution has an existing LAN
- Whether the institution is ready for connectivity

### 9.5 Financial Summary Report (by Institution Type)
Grouped by Primary, Junior, Senior, College:
- Count of institutions
- Total monthly revenue
- Total overdue fines
- Total reconnection fees
- Grand total per category

### 9.6 Payment Ledger
Per-institution chronological payment history showing every payment made — type, amount, method, billing month, and date.

---

## 10. SYSTEM DEPLOYMENT

### 10.1 Deployment Architecture

| Component | Platform | URL |
|---|---|---|
| Frontend (React) | Render Static Site | https://azani-frontend.onrender.com |
| Backend (Node.js) | Render Web Service | https://azani-server.onrender.com |
| Database | MongoDB Atlas (AWS af-south-1) | Cloud-hosted |

### 10.2 Environment Variables (Backend)

| Variable | Purpose |
|---|---|
| MONGODB_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for signing authentication tokens |
| PORT | Server port (5000) |
| MPESA_CONSUMER_KEY | Daraja API consumer key |
| MPESA_CONSUMER_SECRET | Daraja API consumer secret |
| MPESA_SHORTCODE | M-Pesa business shortcode |
| MPESA_PASSKEY | M-Pesa passkey |
| MPESA_CALLBACK_URL | URL for M-Pesa payment callbacks |

### 10.3 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new institution |
| POST | /api/auth/login | Login |
| GET | /api/institution/me | Get current institution data |
| PUT | /api/institution/infrastructure | Update infrastructure details |
| POST | /api/institution/pay-registration | Pay registration fee |
| POST | /api/payments/monthly | Pay monthly bill |
| POST | /api/payments/installation | Pay installation fee |
| POST | /api/payments/reconnection | Pay reconnection fee |
| GET | /api/payments/history | Get institution payment history |
| GET | /api/dashboard/stats | Admin overview statistics |
| GET | /api/dashboard/institutions | All institutions list |
| GET | /api/dashboard/payments | Payment records for all institutions |
| GET | /api/dashboard/defaulters | List of defaulters |
| GET | /api/dashboard/disconnections | List of disconnections |
| GET | /api/dashboard/infrastructure | Infrastructure details |
| GET | /api/dashboard/reports | Financial summary reports |
| GET | /api/dashboard/payment-history/:id | Ledger for specific institution |
| PUT | /api/dashboard/institutions/:id/activate | Activate institution account |
| POST | /api/orders | Place bandwidth order |
| GET | /api/orders | Get all bandwidth orders |
| PUT | /api/orders/:id/status | Update order status |

---

## 11. SYSTEM TESTING

### 11.1 Test Cases

| Test | Input | Expected Output | Result |
|---|---|---|---|
| Register institution | Valid institution details | Account created, token issued | ✅ Pass |
| Register with existing email | Duplicate email | "Email already registered" error | ✅ Pass |
| Login with correct credentials | Valid email & password | JWT token issued, dashboard loads | ✅ Pass |
| Login with wrong password | Invalid password | "Invalid credentials" error shown | ✅ Pass |
| Pay registration fee (Cash) | Cash method selected | Payment submitted, pending admin review | ✅ Pass |
| Admin activates account | Toggle activation | Institution marked active, payment ledger updated | ✅ Pass |
| Monthly fee payment | Cash method | Payment recorded, monthlyFeePaid = true | ✅ Pass |
| Overdue fine calculation | Unpaid previous month | Fine = 15% of monthly fee | ✅ Pass |
| Bandwidth upgrade discount | Upgrade to higher MBPS | 10% discount applied | ✅ Pass |
| No discount on downgrade | Select lower bandwidth | Full price charged, no discount | ✅ Pass |
| Auto-disconnection (10th) | Unpaid institution on 10th | serviceActive = false, needsReconnection = true | ✅ Pass |
| Reconnection fee payment | Pay KSh 1,000 | Service restored, ledger updated | ✅ Pass |
| LAN cost (15 nodes) | lanNodesPurchased = 15 | KSh 20,000 | ✅ Pass |
| Computer cost (3 units) | computersPurchased = 3 | KSh 120,000 | ✅ Pass |
| Defaulters list | Active institution, unpaid | Appears in defaulters report | ✅ Pass |
| Disconnections list | serviceActive = false | Appears in disconnections report | ✅ Pass |
| Report by type | Mixed institutions | Grouped totals per type | ✅ Pass |

---

## 12. IMPORTANT NOTICE — LIVE SYSTEM & ADMIN ACCESS

### 👋 A Friendly Note to the Marker

Hello! Before you access the system, please take a moment to read this — it will save you a lot of frustration! 😊

### 12.1 Render Free Tier — Inactivity Sleep

This system is **fully live and hosted on Render.com** (a free-tier cloud platform). Render automatically **spins down the backend server after 15 minutes of inactivity** to conserve resources.

This means:

- If the system has not been visited recently, the **first load may take 30 – 60 seconds** to wake up
- You may see a blank screen or a slight delay — **this is completely normal!**
- Simply **wait a moment and then refresh** — the system will come alive and work perfectly
- Subsequent page loads will be fast once the server is awake

> 💡 **Tip:** If the page seems stuck, just wait about 45 seconds and refresh. It will work!

### 12.2 Live System URLs

| Component | URL |
|---|---|
| Frontend (React App) | https://azani-frontend.onrender.com |
| Backend API (Node.js) | https://azani-server.onrender.com |

### 12.3 Admin Login Credentials

Use the following credentials to log in as the **Administrator** and access the full Admin Dashboard:

| Field | Value |
|---|---|
| **Email** | admin@azani.co.ke |
| **Password** | Azani@Admin2026! |

> ⚠️ Please do not change the admin password so that other markers can also access the system.

---

## 13. CONCLUSION

The Azani Internet Service Provider Information System successfully addresses all requirements outlined in the system brief. The system provides a fully documented, web-based database management platform that:

- **Registers** institutions with complete contact person details
- **Captures** all three payment types — registration fees, installation fees, and monthly payments — with a full historical ledger
- **Generates** all required lists — registered institutions, defaulters, disconnected services, and infrastructure details
- **Performs** all five required computations — total installation costs, computer and LAN costs, upgrade discounts, overdue fines, reconnection fees, and aggregate totals by institution
- **Generates** comprehensive reports sorted by institution type with all financial totals

The system is deployed on a live cloud environment and is accessible at:

**https://azani-frontend.onrender.com**

It integrates real-time M-Pesa payment processing, automated billing cycles, role-based access control, and a professional, responsive user interface — making it a production-ready solution for Azani Company.

---

*Njoro Day Secondary School*
*Candidate: Maria Goretti Cherotich*
*Computer Studies Project*
*Year: 2026*

---

> Thank you for taking the time to review this system. If you experience any access issues, remember — just wait a moment for Render to wake up and you'll be good to go! 🚀
