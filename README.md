# BillVault

BillVault is a modern, lightweight, and fully client-side invoice and payment tracking application built with **React** and **Vite**.

It allows freelancers, small businesses, and contractors to easily manage their clients, generate invoices, track pending/overdue payments, and monitor their total revenue—all locally within the browser!

## 🚀 Features

- **Dynamic Dashboard**: Instantly view your Total Revenue, Total Billed, Pending Payments, and Overdue Amounts at a glance.
- **Client Management**: Add, edit, and delete customer profiles securely.
- **Invoice Generation**: Create detailed invoices with auto-incrementing IDs (`INV-1`, `INV-2`), line items, taxes, and discounts.
- **Payment Tracking**: Record partial or full payments against invoices and track them by payment method (Cash, UPI, Card, etc.). 
- **100% Local**: No backend or database required! All data is securely persisted directly within your browser's `localStorage`.
- **Modern UI**: Clean, responsive, and beautiful interface built with pure CSS.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Persistence**: Browser `localStorage`

## 📦 Installation & Setup

1. **Clone the repository** (if applicable) or navigate into the project directory:
   ```bash
   cd BillVault
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to start using BillVault!

## 🔧 Building for Production

To create a production-ready optimized build, simply run:
```bash
npm run build
```
This will compile the application into the `dist/` folder, which can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## 📝 Usage Guide

1. **Start by adding a Customer**: Navigate to the **Customers** tab and click "Add Customer".
2. **Create an Invoice**: Head over to the **Invoices** tab, click "New Invoice", select your newly created customer, and add your billing items.
3. **Record a Payment**: Once the customer pays, go to the **Payments** tab, select the invoice, and log the exact amount paid. The dashboard and invoice status will update automatically!

---
*Built with ❤️ using React & Vite.*
