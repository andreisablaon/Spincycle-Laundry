# SpinCycle — Laundry Order Drop-off & Status Tracker

**Course Project:** Midterm Task Performance — Business System Build  
**Developer:** Andrei Carl Sablaon 
**Section:** BSCpE4-101  
**Date:** October 15, 2026  

---

## Business Overview
**SpinCycle** is a local laundry service shop that streamlines customer drop-off requests and order tracking. 

* **Target Users:** Local residents, students, and busy professionals needing laundry services, as well as laundry shop managers/staff.
* **Problem Solved:** Traditional laundry shops rely on paper receipts and manual logbooks, leading to lost customer records, confusion over clothing readiness, and unorganized pricing updates. SpinCycle digitizes the drop-off process, letting customers request services online while allowing staff to manage orders in real time.

---

## Key Features

### 1. Landing Page (Public View)
- Publicly accessible page requiring no login.
- Displays business name, services Offered (Wash & Fold, Dry Cleaning, Duvet Wash), and base pricing.
- Features a prominent **"Book Your Drop-off Now"** call-to-action button.
- Mobile-friendly, responsive layout powered by Bootstrap 5.

### 2. User Authentication & Access Control
- **Registration & Login:** Account creation with full name, email, and password validation.
- **Security:** Passwords hashed using `bcryptjs` before storage in the SQLite database.
- **Session Management:** Protected routes requiring authentication before accessing the dashboard.
- **Two Access Levels:**
  - **Regular User (Customer):** Can submit new drop-off orders and view/track only their own order status.
  - **Admin (Staff/Owner):** Centralized dashboard to view all customer orders, update statuses, adjust final pricing, and cancel/delete records.

### 3. Core Entity CRUD Operations (Laundry Orders)
- **Create:** Customers submit new laundry drop-off requests specifying service type, weight estimate, and special notes. Input validation prevents empty submissions.
- **Read:** Real-time dashboard list displaying orders, service type, weight, price, and current status (`Pending`, `Washing`, `Ready for Pickup`, `Completed`).
- **Update:** Admins can modify order statuses and final total prices.
- **Delete:** Admins can delete or cancel orders. Features a browser confirmation prompt (`confirm()`) to prevent accidental data loss.
- **Persistence:** All user accounts and order records persist in a local SQLite database (`database.db`).

---

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite3 (`sqlite` / `sqlite3`)
- **Templating Engine:** EJS (Embedded JavaScript)
- **Authentication & Security:** `express-session`, `bcryptjs`
- **Frontend Styling:** Bootstrap 5 (via CDN)

---

## Setup & Local Installation

Follow these steps to set up and run the project locally on a clean machine:

1. **Clone or Download the Repository:**
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd spincycle-laundry