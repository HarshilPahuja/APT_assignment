# Real-Time Order Management System

We basically had 3 approaches to design this system.

## 1) Polling
Every client continuously polls the database every few seconds.

### Problems:
- Not scalable
- If a lot of clients are using the system, it creates heavy load on the server
- Multiple unnecessary HTTP requests

---

## 2) One Backend CRON Job
Instead of all clients polling the server, only one backend script polls every few seconds and updates clients.

### Benefits:
- Better scalability than option 1

### Problems:
- The script still runs even when there is no change in database
- Wasteful executions

---

# BEST OPTION (Implemented)

## 3) Using Database Triggers + Realtime

MySQL has a feature called triggers:
when a change occurs in the database, it can automatically run a function or script.

I implemented a similar approach using Supabase Realtime with PostgreSQL.

Supabase Realtime automatically notifies the backend whenever database changes occur.

### Benefits:
- Scalable
- No wasteful runs
- Instant updates

---

# We also use WebSockets (Socket.IO)?

WebSockets create one persistent connection between client and server instead of sending multiple HTTP requests repeatedly whenever data changes.

This allows real-time communication with low latency.

---

# Final Tech Stack

## Frontend
- Vanilla HTML
- Vanilla CSS
- Vanilla JavaScript

## Backend
- Node.js
- Socket.IO
- Supabase

## Database
- PostgreSQL (via Supabase)

---

# Architecture Diagram

```text
                +----------------------+
                |   Frontend Clients   |
                | (Customer / Admin)   |
                +----------+-----------+
                           ^
                           |  Socket.IO
                           v
                +----------+-----------+
                |    Node.js Backend   |
                |   Socket.IO Server   |
                +----------+-----------+
                           ^
                           | Supabase Client
                           v
                +----------+-----------+
                |  Supabase PostgreSQL |
                +----------+-----------+
                           ^
                           |
                  Database Changes
                           |
                           v
                +----------------------+
                |  Supabase Realtime   |
                +----------------------+
                           |
                           v
                +----------------------+
                |   Backend Listener   |
                +----------------------+
                           |
                           v
                +----------------------+
                | Socket.IO Broadcast  |
                +----------------------+
                           |
                           v
                +----------------------+
                | Connected Clients    |
                +----------------------+
```

---

# Project Structure

```text
APT_assignment/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── login.html
│   ├── admin.html
│   ├── customer.html
│   └── script.js
```

---

# How To Run The Application

## Clone the repository

```bash
git clone https://github.com/HarshilPahuja/APT_assignment
```

---

## Install backend dependencies

```bash
cd backend
npm install
```

---

# Environment Variables

Create a `.env` file inside the `backend` folder and add:

```env
SUPABASE_URL=https://eqlxszjxpzuvllcihkhz.supabase.co
SUPABASE_KEY=sb_publishable_PhiPki_K92De-ar-qWSVnQ_cNtuUMDO
PORT=3000
```

---

# Start Backend Server

```bash
cd backend
node server.js
```

---

# Run Frontend

Right click on `login.html` and open using **Live Server**.

## Demo Login Credentials

```text
username = harshil
password = 123
```

Also open `admin.html` using Live Server.

---

# Screenshots

## Login Page
(Add Screenshot Here)

## Customer Dashboard
(Add Screenshot Here)

## Admin Dashboard
(Add Screenshot Here)

## Supabase tables
(Add Screenshot Here)

## supabase_realtime setup
(Add Screenshot Here)

---

# Demo Video

(Add Demo Video Link Here)