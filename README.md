# ShopKart - Lab 01 (Backend) + Lab 02 (Frontend)

## 1. Backend
```
cd backend
npm install
```
Open `backend/.env` and paste your MongoDB connection string into `MONGO_URI`.
```
npm start
```
You should see "MongoDB connected" and "Server running on port 5000".

## 2. Frontend (open a second terminal)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173/register

Always start the backend first.

## 3. Lab 03 - Products
Optional: load sample products (run inside `backend/`):
```
npm run seed
```
Then open http://localhost:5173/products

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /products | Create product |
| GET | /products?search=&category=&sort=price_asc\|price_desc | List / search / filter / sort |
| GET | /products/:id | Single product |
