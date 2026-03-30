# LudoStore

A modern e-commerce web application for selling Ludo boards, built with a Django backend and React frontend.

---

## Project Structure

```
ludostore/
├── ludostore-web/   # React frontend
├── ludostore-api/   # Django backend
```

---

## Features

* Product listing and detail pages
* Cart system
* Paystack payment integration
* WhatsApp ordering option
* and more

---

## Tech Stack

### Frontend

* React

### Backend

* Django
* Django REST Framework 
---

## Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/GordenArcher/ludostore.git
cd ludostore
```

---

### 2. Backend Setup (Django)

```
cd ludostore-api

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

---

### 3. Frontend Setup (React)

```
cd ludostore-web

npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in both frontend and backend directories.

### Backend (.env)

```
SECRET_KEY=your_secret_key
DEBUG=True
PAYSTACK_SECRET_KEY=your_key
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password
```

---

## Future Improvements

* Order tracking system
* Product reviews and ratings
* Admin dashboard
* Mobile app (React Native)

---

## License

This project is for educational and commercial use.
