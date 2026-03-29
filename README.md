# Enterprise Reimbursement Management System

A complete, working, hackathon-ready MERN stack web application with Firebase Authentication for managing enterprise reimbursements.

## Features

- **Company Registration**: Register a company with a domain and default currency.
- **User Authentication**: Secure signup/login using Firebase Auth.
- **Role-Based Access**: Support for Employees, Managers, Finance, and Directors.
- **Expense Submission**: Submit expenses with multi-currency support and receipt uploads.
- **Multi-Level Approval Workflow**: Automated routing to Managers, Finance, and Directors based on amount thresholds.
- **Fraud Detection**: Automatic detection of potential duplicate expenses.
- **Dashboards**: Contextual views for tracking personal expenses and pending approvals.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose) with in-memory fallback for instant demos
- **Authentication**: Firebase Authentication

## Project Structure

- `/src`: Frontend React application
- `/server`: Backend Node.js/Express application

Please see `SETUP.md` for detailed instructions on how to run the project.
