import sqlite3
import json
import random
import uuid
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db

app = Flask(__name__)
app.secret_key = 'nike_airpulse_jwt_secret_token_inr_2026'
app.config['JSON_SORT_KEYS'] = False

def row_to_dict(row):
    d = dict(row)
    for field in ['tech_specs', 'sizes', 'features']:
        if field in d and isinstance(d[field], str):
            try:
                d[field] = json.loads(d[field])
            except Exception:
                pass
    return d

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

# ============================================================
# USER AUTHENTICATION API (REGISTER, LOGIN, LOGOUT, ME)
# ============================================================
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip()

    if not name or not email or not password:
        return jsonify({"error": "Please provide your full name, email, and password."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    conn = get_db()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "An account with this email address already exists."}), 409

    pwd_hash = generate_password_hash(password)
    cursor.execute("""
    INSERT INTO users (name, email, password_hash, phone)
    VALUES (?, ?, ?, ?)
    """, (name, email, pwd_hash, phone))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Log in user immediately
    session['user_id'] = user_id
    session['user_name'] = name
    session['user_email'] = email

    return jsonify({
        "success": True,
        "message": f"Welcome to Nike Member Pulse, {name}!",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "phone": phone
        }
    })

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"error": "Please enter both email and password."}), 400

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid email or password credentials."}), 401

    session['user_id'] = user['id']
    session['user_name'] = user['name']
    session['user_email'] = user['email']

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "phone": user['phone']
        }
    })

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully."})

@app.route('/api/me', methods=['GET'])
def api_me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"logged_in": False})

    conn = get_db()
    user = conn.execute("SELECT id, name, email, phone, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if not user:
        session.clear()
        return jsonify({"logged_in": False})

    return jsonify({
        "logged_in": True,
        "user": dict(user)
    })

@app.route('/api/my-orders', methods=['GET'])
def api_my_orders():
    user_id = session.get('user_id')
    user_email = session.get('user_email')
    
    if not user_id and not user_email:
        return jsonify({"orders": []})

    conn = get_db()
    if user_id:
        rows = conn.execute("SELECT * FROM orders WHERE user_id = ? OR email = ? ORDER BY created_at DESC", (user_id, user_email)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC", (user_email,)).fetchall()
    conn.close()

    orders = []
    for r in rows:
        od = dict(r)
        try:
            od['items'] = json.loads(od['items'])
        except Exception:
            pass
        orders.append(od)

    return jsonify({"orders": orders})

# ============================================================
# PRODUCTS & CATALOG API
# ============================================================
@app.route('/api/shoes', methods=['GET'])
def get_shoes():
    category = request.args.get('category', 'all')
    search = request.args.get('search', '').strip().lower()
    cushion = request.args.get('cushion', 'all')
    sort_by = request.args.get('sort', 'featured')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = "SELECT * FROM shoes WHERE 1=1"
    params = []

    if category and category != 'all':
        query += " AND category = ?"
        params.append(category)

    if cushion and cushion != 'all':
        query += " AND cushion_level = ?"
        params.append(cushion)

    if min_price is not None:
        query += " AND price >= ?"
        params.append(min_price)

    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(subtitle) LIKE ? OR LOWER(description) LIKE ? OR LOWER(colorway) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    if sort_by == 'price_asc':
        query += " ORDER BY price ASC"
    elif sort_by == 'price_desc':
        query += " ORDER BY price DESC"
    elif sort_by == 'rating_desc':
        query += " ORDER BY rating DESC, reviews_count DESC"
    elif sort_by == 'newest':
        query += " ORDER BY id DESC"
    else:
        query += " ORDER BY id ASC"

    conn = get_db()
    rows = conn.execute(query, params).fetchall()
    conn.close()

    shoes = [row_to_dict(r) for r in rows]
    return jsonify({"shoes": shoes, "count": len(shoes), "currency": "INR", "currency_symbol": "₹"})

@app.route('/api/shoes/<int:shoe_id>', methods=['GET'])
def get_shoe_detail(shoe_id):
    conn = get_db()
    shoe = conn.execute("SELECT * FROM shoes WHERE id = ?", (shoe_id,)).fetchone()
    if not shoe:
        conn.close()
        return jsonify({"error": "Shoe not found"}), 404

    shoe_data = row_to_dict(shoe)

    # Fetch reviews
    reviews_rows = conn.execute(
        "SELECT * FROM reviews WHERE shoe_id = ? ORDER BY created_at DESC", 
        (shoe_id,)
    ).fetchall()
    reviews = [dict(r) for r in reviews_rows]

    # Fetch similar / recommended shoes in same category
    similar_rows = conn.execute(
        "SELECT * FROM shoes WHERE category = ? AND id != ? LIMIT 3",
        (shoe['category'], shoe_id)
    ).fetchall()
    similar = [row_to_dict(r) for r in similar_rows]

    conn.close()
    return jsonify({
        "shoe": shoe_data,
        "reviews": reviews,
        "similar": similar,
        "currency_symbol": "₹"
    })

# ============================================================
# NIKE STRIDE AI RECOMMENDATION ENGINE (INR PRICED)
# ============================================================
@app.route('/api/recommend', methods=['POST'])
def recommend_shoes():
    data = request.get_json() or {}
    activity = data.get('activity', 'any')
    cushion = data.get('cushion', 'any')
    arch = data.get('arch', 'any')
    surface = data.get('surface', 'any')
    intensity = data.get('intensity', 'any')
    max_budget = float(data.get('max_budget', 26000)) # INR budget

    conn = get_db()
    shoes = [row_to_dict(r) for r in conn.execute("SELECT * FROM shoes").fetchall()]
    conn.close()

    scored_shoes = []

    for shoe in shoes:
        score = 40
        reasons = []

        # 1. Activity / Category weighting (Up to 30 pts)
        if activity != 'any':
            if shoe['category'] == activity:
                score += 30
                reasons.append(f"Precision-engineered specifically for {activity.title()} athletes.")
            else:
                score -= 15
        else:
            score += 15

        # 2. Cushioning preference (Up to 20 pts)
        if cushion != 'any':
            if shoe['cushion_level'] == cushion:
                score += 20
                reasons.append(f"Features custom {cushion.title()} cushioning matching your exact step profile.")
            elif cushion in ['maximum', 'responsive'] and shoe['cushion_level'] in ['maximum', 'responsive']:
                score += 10
            else:
                score -= 5
        else:
            score += 10

        # 3. Arch Support (Up to 15 pts)
        if arch != 'any':
            if shoe['arch_support'] == arch:
                score += 15
                if arch == 'high_arch':
                    reasons.append("Enhanced midsole contour & rigid Flyplate support for high arches.")
                elif arch == 'flat_feet':
                    reasons.append("Wide base geometry and lateral Hyperlift containment suited for flat feet.")
                else:
                    reasons.append("Universal neutral geometry for smooth natural gait progression.")
            elif shoe['arch_support'] == 'neutral':
                score += 8
            else:
                score -= 5
        else:
            score += 8

        # 4. Surface type (Up to 10 pts)
        if surface != 'any':
            if shoe['surface'] == surface:
                score += 10
                reasons.append(f"Traction tread optimized for {surface} grip and longevity in India.")
            else:
                score += 2

        # 5. Intensity (Up to 10 pts)
        if intensity != 'any':
            if shoe['intensity'] == intensity:
                score += 10
                reasons.append(f"Built to handle {intensity} training loads without performance fatigue.")
            else:
                score += 4

        # 6. Budget constraint (INR)
        if shoe['price'] <= max_budget:
            score += 10
        else:
            over = shoe['price'] - max_budget
            penalty = min(25, int(over / 400))
            score -= penalty

        normalized_score = max(68, min(99, int(score)))

        if not reasons:
            reasons.append("High overall performance rating across diverse Indian road & court conditions.")

        shoe_copy = dict(shoe)
        shoe_copy['match_score'] = normalized_score
        shoe_copy['match_reasons'] = reasons[:3]
        scored_shoes.append(shoe_copy)

    scored_shoes.sort(key=lambda s: (s['match_score'], s['rating']), reverse=True)

    return jsonify({
        "recommendations": scored_shoes[:5],
        "total_analyzed": len(shoes),
        "best_match": scored_shoes[0] if scored_shoes else None,
        "currency_symbol": "₹"
    })

# ============================================================
# REVIEWS & CHECKOUT (IN RUPEES)
# ============================================================
@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.get_json() or {}
    shoe_id = data.get('shoe_id')
    user_name = data.get('user_name', '').strip() or session.get('user_name', 'Verified Athlete')
    rating = int(data.get('rating', 5))
    title = data.get('title', '').strip()
    comment = data.get('comment', '').strip()

    if not shoe_id or not user_name or not comment:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO reviews (shoe_id, user_name, rating, title, comment, verified)
    VALUES (?, ?, ?, ?, ?, 1)
    """, (shoe_id, user_name, rating, title or "Great Shoe!", comment))

    stats = cursor.execute("""
    SELECT AVG(rating), COUNT(rating) FROM reviews WHERE shoe_id = ?
    """, (shoe_id,)).fetchone()

    new_rating = round(stats[0] or rating, 1)
    new_count = stats[1] or 1

    cursor.execute("""
    UPDATE shoes SET rating = ?, reviews_count = ? WHERE id = ?
    """, (new_rating, new_count, shoe_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "new_rating": new_rating,
        "new_count": new_count,
        "message": "Review submitted successfully!"
    })

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json() or {}
    customer_name = data.get('customer_name', '').strip()
    email = data.get('email', '').strip()
    address = data.get('shipping_address', '').strip()
    items = data.get('items', [])
    discount = float(data.get('discount', 0))
    subtotal = float(data.get('subtotal', 0))
    total = float(data.get('total', 0))
    payment_method = data.get('payment_method', 'UPI / NetBanking')
    user_id = session.get('user_id')

    if not customer_name or not email or not items:
        return jsonify({"error": "Missing order details"}), 400

    order_num = f"NK-IN-{random.randint(1000, 9999)}-{random.randint(10000, 99999)}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO orders (
        order_number, user_id, customer_name, email, shipping_address, items,
        subtotal, discount, total, payment_method, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_num, user_id, customer_name, email, address or "Standard Delivery, India",
        json.dumps(items), subtotal, discount, total, payment_method, "Confirmed"
    ))

    # Deduct stock
    for item in items:
        shoe_id = item.get('id')
        qty = item.get('quantity', 1)
        if shoe_id and isinstance(shoe_id, int):
            cursor.execute("UPDATE shoes SET stock = MAX(0, stock - ?) WHERE id = ?", (qty, shoe_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "order_number": order_num,
        "status": "Confirmed",
        "delivery_estimate": "2-3 Business Days (Nike Air Express India)",
        "currency_symbol": "₹",
        "total": total,
        "message": f"Thank you {customer_name}! Your Nike India order {order_num} has been confirmed."
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    total_shoes = conn.execute("SELECT COUNT(*) FROM shoes").fetchone()[0]
    total_reviews = conn.execute("SELECT COUNT(*) FROM reviews").fetchone()[0]
    top_shoe = conn.execute("SELECT name, rating FROM shoes ORDER BY reviews_count DESC LIMIT 1").fetchone()
    conn.close()
    return jsonify({
        "total_shoes": total_shoes,
        "total_reviews": total_reviews,
        "featured_model": dict(top_shoe) if top_shoe else None,
        "currency": "INR",
        "currency_symbol": "₹"
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
