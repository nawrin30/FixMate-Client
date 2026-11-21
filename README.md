# 🔧 FixMate – Smart Device & Home Appliance Repair Platform

<p align="center">
  A smart and convenient platform connecting customers with professional repair technicians.
</p>

<p align="center">
  <a href="https://fixmate20.vercel.app">🌐 Live Website</a>
</p>

## 📌 Project Overview

FixMate is a full-stack web application designed to simplify the process of repairing smartphones, refrigerators, and other home appliances.

Customers can explore repair services, submit repair requests, track bookings, and make online payments. Technicians can manage their services and repair requests, while administrators can manage users, services, and platform activities.

## 🌐 Live URL

**Frontend:** https://fixmate20.vercel.app

**Backend API:** https://server-one-eta-23.vercel.app

## 🔐 Admin Demo Credentials

Use the following credentials to evaluate the admin dashboard:

- **Email:** YOUR_ADMIN_EMAIL
- **Password:** YOUR_DEMO_ADMIN_PASSWORD

> Replace these placeholders with your actual demo admin account credentials before submission. Do not publish your private production password.

## ✨ Key Features

### 👤 Customer
- Register and securely log in.
- Browse available repair services.
- Explore smartphone and home appliance repair options.
- Submit repair requests.
- Manage bookings and repair requests.
- View payment information.
- Complete payments through Stripe.

### 🛠️ Technician
- Access a dedicated technician dashboard.
- Manage repair services.
- View and manage assigned requests.
- Track repair activities.

### 👑 Admin
- Access a dedicated admin dashboard.
- Manage customers and technicians.
- Manage repair services.
- Monitor bookings and payments.
- Manage platform activities.

### 🎨 User Experience
- Modern and responsive interface.
- Role-based dashboards.
- Organized navigation and service sections.
- Image hosting and display using ImgBB.
- Secure authentication and API communication.

## 🧰 Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| React.js | UI development |
| TypeScript | Type safety |
| Better Auth | Authentication |
| JWT | API authorization |
| Stripe | Online payments |
| ImgBB | Image hosting |
| CSS | Styling |

## 📦 NPM Packages

Main packages and tools used in the client:

- `next`
- `react`
- `react-dom`
- `typescript`
- `better-auth`
- `jose`
- `sonner`

Additional packages may be used for UI components, icons, forms, and utilities.

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/nawrin30/FixMate-Client.git
```

### 2. Navigate to the project

```bash
cd FixMate-Client
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
JWT_SECRET=your_shared_jwt_secret
MONGODB_URI=your_mongodb_connection_string
DB_NAME=fixmate
```

**Important:** Use the same `JWT_SECRET` in both client and server configurations.

Never commit `.env.local` to GitHub.

### 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🏗️ Project Architecture

```text
FixMate-Client/
│
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   └── lib/
│
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*Directory structure may vary depending on the current implementation.*

## 🚀 Deployment

The client application is deployed using Vercel.

## Live Website:https://fixmate20.vercel.app

## 🔗 Related Repository

**Backend Repository:** FixMate Server

## 👩‍💻 Developer

**Nawrin Tarannum**

- GitHub: https://github.com/nawrin30
- LinkedIn: https://www.linkedin.com/in/nawrin-tarannum/

---

<p align="center">
  Built with ❤️ for smarter repair service management.
</p>