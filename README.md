# StudioSpace Server 🚀

**StudioSpace Server** is the robust, secure, and scalable backend REST API built for the StudioSpace peer-to-peer creative studio marketplace. It handles user authentication, studio listing management (CRUD), interactive booking reservations with date-overlap prevention, secure HTTP-only cookies, and dynamic filtering.

---

## 🔗 Live Site & Repositories

- **Live Server URL:** [Live Server](https://b14-a8-catharry.vercel.app/login)
- **Server Repository:** [https://github.com/khalidhasanbadhon502/b14-a8-cat_harry_server](https://github.com/khalidhasanbadhon502/b14-a8-cat_harry_server)
- **Client Repository:** [https://github.com/khalidhasanbadhon502/b14-a8-cat_harry](https://github.com/khalidhasanbadhon502/b14-a8-cat_harry)

---

## ✨ Key Features

- **RESTful API Architecture:** Clean, modular route structure separating authentication, studios, and bookings.
- **Secure Authentication & Sessions:** Token-based security and HTTP-only cookie management for seamless frontend-backend integration.
- **Advanced Studio CRUD Operations:** Endpoints allowing hosts to create, read, update, and delete their studio properties securely.
- **Smart Booking & Overlap Validation:** Intelligent server-side date-checking logic to prevent double-booking conflicts on the same studio time slot.
- **Dynamic Search & Filtering:** Query parameters supporting category-based filtering, keyword search, and location sorting.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript / JavaScript)
- **Database & ODM:** MongoDB Atlas, Mongoose
- **Authentication:** JWT (JSON Web Tokens) / Better-Auth
- **Security & Utilities:** CORS, dotenv, Cookie-parser
- **Deployment:** Render / Vercel

---

## 🚀 Local Setup Instructions

Follow these steps to run the server locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/khalidhasanbadhon502/b14-a8-cat_harry_server.git](https://github.com/khalidhasanbadhon502/b14-a8-cat_harry_server.git)
   cd b14-a8-cat_harry_server
