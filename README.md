# ⚡ NIKE // AIRPULSE INDIA — High-Performance Footwear & Biomechanical Recommendation System

A flagship Nike-inspired sneaker e-commerce and AI recommendation web application built with **HTML5, Vanilla CSS3, JavaScript (ES6+), Python Flask, and SQLite3**, configured with **Indian Rupees (₹)** and a **Member Authentication System**.

---

## 🇮🇳 Currency & India Store Configuration
- **All Prices in Indian Rupees (₹)**:
  - Nike Air Zoom Alphafly 3: **₹22,795** (was ₹24,995)
  - Air Jordan 1 Retro High OG: **₹16,995** (was ₹18,995)
  - Nike Air Max Dn Dynamic: **₹13,995** (was ₹15,995)
  - Nike Vaporfly 3 Next%: **₹20,695** (was ₹22,795)
  - Nike Metcon 9 AMP: **₹12,795** (was ₹13,995)
  - Nike Dunk Low Retro Craft: **₹8,995** (was ₹9,995)
  - Nike Pegasus 41 ReactX: **₹11,895** (was ₹12,995)
  - Nike G.T. Cut 3 Pro: **₹17,495** (was ₹19,995)
  - Nike Invincible 3: **₹16,995** (was ₹18,995)
  - Nike Air Max Plus Drift: **₹15,995** (was ₹17,995)
  - Nike Free Metcon 5: **₹9,995** (was ₹11,495)
  - Nike Air Force 1 '07: **₹10,795** (was ₹11,995)
  - Nike By You Bespoke Pair: **₹24,995**
- **Free Shipping Threshold**: Free Nike Express Delivery across India on orders over **₹14,000**.
- **Payment Methods**: UPI (Google Pay, PhonePe, Paytm), Indian Debit/Credit Cards (Visa, Mastercard, RuPay), and NetBanking.

---

## 🔐 Member Authentication & Accounts
- **Dedicated Login Page**: [`/login`](http://127.0.0.1:5000/login) with demo account autofill (`marcus@nike.in` / `NikePulse2026!`).
- **Dedicated Register Page**: [`/register`](http://127.0.0.1:5000/register) with full name, email, 10-digit Indian phone number, and password.
- **Secure Password Hashing**: Powered by Werkzeug `generate_password_hash` and `check_password_hash` stored in the SQLite `users` table.
- **Header Profile Widget**: Shows user avatar, first name, and dropdown menu with "My Orders" and "Sign Out".
- **Order Tracking**: Automatically associates placed orders with the logged-in user account for order history tracking in SQLite.

---

## 🚀 Key Features

### 1. 👟 High-Octane Nike Aesthetics
- **Dark Mode & Glassmorphism**: Midnight obsidian background, frosted glass panels, and high-voltage **Electric Volt (`#ccff00`)** accents.
- **Kinetic Typography**: Google Fonts (`Syne`, `Outfit`, `Space Grotesk`).
- **Interactive 3D Perspective Hero Card**: Mouse tracking hover tilt and real-time colorway aura switcher.
- **Commercial Studio Photography**: 6 photorealistic AI-generated sneaker assets across Road Running, Basketball, Streetwear, and Gym Training.

### 2. ⚡ Nike Stride AI™ Biomechanical Recommendation Engine
- **5-Step Interactive Fit Quiz**:
  1. *Sport & Purpose*: Road Running & Marathons, Basketball & Court, Streetwear & Everyday, Gym & HIIT
  2. *Cushion Feel*: Maximum Plush Cloud, Responsive Energy Spring, Balanced Everyday, Firm & Stable Base
  3. *Arch Profile*: Neutral Normal Arch, High Arch Contoured, Flat Feet / Overpronation
  4. *Surface & Intensity*: Indian Road Asphalt, Court Hardwood, City Street, Gym Rubber Turf
  5. *Budget Cap Slider (INR)*: Customizable from ₹8,000 to ₹25,000+
- **Intelligent Scoring Algorithm (`/api/recommend`)**: Weighted compatibility scoring across category, cushion, arch support, surface traction, and Indian Rupee budget.
- **Personalized Biomechanical Breakdown**: Returns **Top #1 Match with Match % (e.g., 99% Match)**, bulleted fit rationale, direct "Add to Bag", and secondary alternatives.

### 3. 🎨 "Nike By You" Interactive Customizer Studio
- **Upper Body Tinting**: Real-time hue shifting (Obsidian, Crimson Blaze, Cyber Cyan, Electric Mint, Championship Gold).
- **Air Zoom Pod Underglow**: Dynamic light aura adjustment (Volt, Neon Infrared, Cryo Cyan, Ultraviolet, Pure Xenon White).
- **Laser Heel Tag Engraving**: Real-time typography inscription on the shoe heel preview with 8-character limit.
- **Direct Custom Order**: Adds bespoke shoe to cart with engraved personalization (₹24,995).

### 4. 🛍️ Dynamic Shopping Bag & Checkout
- **Slide-over Cart Drawer**: Real-time quantity adjustments, size indicator, subtotal, and Free Shipping tracker (₹14,000 threshold).
- **Promo Codes**: Working discount vouchers (`JUSTDOIT15` for 15% off, `NIKEVIP` for 20% off).
- **SQLite Database Orders**: Orders are persisted into the `orders` SQLite table with custom order reference numbers (e.g., `NK-IN-2192-99178`), tracking delivery estimates, and stock deduction.

### 5. ⭐ Community & Athlete Reviews
- Stored and queried from the SQLite `reviews` table.
- Users can post verified ratings and reviews, dynamically recalculating the shoe's star rating in real time.

---

## 🛠️ Project Structure

```
shoes recommandation system/
├── app.py                 # Flask server with RESTful API, Auth, & Stride AI engine
├── database.py            # SQLite schema initialization (users, shoes, orders, reviews)
├── requirements.txt       # Dependencies (Flask, Werkzeug)
├── shoes.db               # SQLite database file
├── static/
│   ├── css/
│   │   ├── style.css      # Vanilla CSS design system (dark mode, glassmorphism, animations)
│   │   └── auth.css       # Dedicated login & registration styling
│   ├── js/
│   │   ├── app.js         # Catalog filtering, search, cart drawer, auth widget, and checkout
│   │   ├── recommender.js # Nike Stride AI multi-step fit questionnaire (INR)
│   │   └── customizer.js  # Nike By You interactive sneaker studio
│   └── images/            # High-resolution commercial sneaker photography
│       ├── hero_sneaker.jpg
│       ├── basketball_sneaker.jpg
│       ├── streetwear_sneaker.jpg
│       ├── marathon_racer.jpg
│       ├── training_sneaker.jpg
│       └── lifestyle_sneaker.jpg
└── templates/
    ├── index.html         # Main storefront layout with INR currency and Auth widget
    ├── login.html         # Nike Member sign-in page
    └── register.html      # Nike Member registration page
```

---

## 🏃 Running the Application

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize / Reset Database**:
   ```bash
   python database.py
   ```

3. **Start the Flask Server**:
   ```bash
   python app.py
   ```

4. **Open in Browser**:
   - Storefront: [http://127.0.0.1:5000](http://127.0.0.1:5000)
   - Member Login: [http://127.0.0.1:5000/login](http://127.0.0.1:5000/login)
   - Member Registration: [http://127.0.0.1:5000/register](http://127.0.0.1:5000/register)
