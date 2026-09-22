# Blood Donation Management System (Full-Stack Student Project)

A clean, full-stack web application designed for academic evaluation. It provides completely separate, role-protected workflows for **Blood Donors** and **Hospitals** without role switchers, complex SaaS bloat, or external dependencies.

---

## 🚀 Key Features

### 1. Two Distinct User Roles & Strict Separation
- **Donor Role**:
  - **Dashboard**: Welcome message, Blood Group, Availability status toggle (ON/OFF), Pending blood requests count, and Last donation date.
  - **Donor Profile**: Full personal information (with **Blood Group strictly read-only**) and health parameters. Toggleable Edit Profile with Save Changes and Cancel buttons.
  - **Blood Requests**: Hospital blood requests targeted to the donor, with **Accept** and **Reject** actions.
  - **Donation History**: Simple, clean tabular record of donations (Hospital, Date, Blood Group, Units, Status).
- **Hospital Role**:
  - **Dashboard**: Total blood units in stock, Active blood requests count, Pending donor responses count, and Quick Action buttons.
  - **Blood Inventory**: Live stock tracking across all 8 standard blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) with individual unit update controls.
  - **Create Blood Request**: Input patient requirements (Name, Blood Group, Units, Urgency, Date, Notes).
  - **Automatic Donor Matching**: Automatically finds donors in the same city with matching blood group, availability `ON`, and eligibility `Eligible`.
  - **Blood Requests**: View all created hospital requests.
  - **Donor Responses**: Track responses from matched city donors (`Pending`, `Accepted`, `Rejected`).
- **Role Isolation**:
  - Donors cannot access `/hospital/*` (automatically redirected to `/donor/dashboard`).
  - Hospitals cannot access `/donor/*` (automatically redirected to `/hospital/dashboard`).
  - JWT tokens encode the user's role and Express middleware enforces access control at the API level.

### 2. Simplified Academic Eligibility Engine
Automated backend evaluation based on project criteria:
- **Weight**: Minimum 50 kg
- **Donation Interval**: Minimum 90 days since last donation
- **Recent Fever**: Must be "No"
- **Recent Surgery**: Must be "No"
- **Chronic Conditions**: Evaluated from configured list (`Diabetes`, `Hypertension`, `Heart Disease`, `Kidney Disease`, `Asthma`, `Other`, `None`).
- Displays 🟢 **Eligible** or 🔴 **Not Eligible** with a clear explanation.

---

## 🔑 Demo Accounts (Out-of-the-Box)

The project includes preloaded test accounts and demo data in the in-memory data store so you can test all workflows immediately without setting up a database:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@demo.com` | `password123` | Name: **Chandrika**, Blood Group: **O+**, City: **Hyderabad**, Status: **Eligible** |
| **Hospital** | `hospital@demo.com` | `password123` | Name: **City General Hospital**, City: **Hyderabad**, Units: **79** |

---

## 🛠️ Project Structure

```
FSD project/
├── backend/
│   ├── controllers/         # authController, donorController, hospitalController
│   ├── middleware/          # authMiddleware (JWT), roleMiddleware (requireRole)
│   ├── models/              # Mongoose Schemas (User, Donor, Hospital, BloodInventory,
│   │                        #  BloodRequest, DonorResponse, DonationHistory)
│   ├── routes/              # Express API route modules
│   ├── services/
│   │   ├── eligibilityService.js  # Simplified eligibility calculations
│   │   ├── matchingService.js     # City & blood group donor matching
│   │   └── mockStore.js           # In-memory test store with pre-seeded demo records
│   ├── utils/
│   │   └── db.js            # MongoDB connection helper (ready for your MONGO_URI)
│   ├── server.js            # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, StatusBadge
│   │   ├── context/         # AuthContext (JWT session state & user role)
│   │   ├── layouts/         # DonorLayout, HospitalLayout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── donor/       # DonorDashboard, DonorProfile, DonorBloodRequests, DonationHistory
│   │   │   └── hospital/    # HospitalDashboard, BloodInventory, CreateBloodRequest,
│   │   │                    #  HospitalBloodRequests, DonorResponses
│   │   ├── routes/          # AppRoutes, ProtectedRoute (role guards)
│   │   ├── services/        # Axios API client with auth interceptor
│   │   ├── index.css        # Clean red & white student project styling
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚦 How to Run the Application

### 1. Start the Backend
Open a terminal in the `backend/` folder:
```bash
cd backend
npm install
npm start
```
The backend will start on **`http://localhost:5000`**.

### 2. Start the Frontend
Open a second terminal in the `frontend/` folder:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on **`http://localhost:5173`**.

Open your browser and navigate to:
**`http://localhost:5173`**

---

## 🍃 Connecting MongoDB Later (When You Are Ready)

The backend has clean Mongoose models and a connection utility in `backend/utils/db.js`.
To connect your own MongoDB database:

1. Open `backend/.env` (or copy from `.env.example`).
2. Add your MongoDB connection string:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/blood_donation
   # or MongoDB Atlas:
   # MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blood_donation
   ```
3. Restart the backend server. The app will detect `MONGO_URI` and connect to your database automatically.
