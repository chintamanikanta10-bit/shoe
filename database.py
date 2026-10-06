import sqlite3
import json
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shoes.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Drop existing tables to refresh schema with INR prices & user auth
    cursor.execute("DROP TABLE IF EXISTS reviews")
    cursor.execute("DROP TABLE IF EXISTS orders")
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("DROP TABLE IF EXISTS shoes")

    # Create users table
    cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create shoes table (Prices in Indian Rupees ₹)
    cursor.execute("""
    CREATE TABLE shoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 120,
        image_url TEXT NOT NULL,
        colorway TEXT NOT NULL,
        badge TEXT,
        cushion_level TEXT NOT NULL,
        arch_support TEXT NOT NULL,
        surface TEXT NOT NULL,
        intensity TEXT NOT NULL,
        description TEXT NOT NULL,
        tech_specs TEXT NOT NULL,
        sizes TEXT NOT NULL,
        features TEXT NOT NULL,
        stock INTEGER DEFAULT 25
    )
    """)

    # Create reviews table
    cursor.execute("""
    CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shoe_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        title TEXT NOT NULL,
        comment TEXT NOT NULL,
        verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shoe_id) REFERENCES shoes (id)
    )
    """)

    # Create orders table with optional user_id link
    cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT DEFAULT 'UPI / NetBanking',
        status TEXT DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Create sample default demo user
    demo_password_hash = generate_password_hash("NikePulse2026!")
    cursor.execute("""
    INSERT INTO users (name, email, password_hash, phone)
    VALUES (?, ?, ?, ?)
    """, ("Marcus Vance", "marcus@nike.in", demo_password_hash, "+91 98765 43210"))

    # Sample shoes catalog with authentic Indian Rupee (₹) pricing
    shoes_data = [
        {
            "name": "Nike Air Zoom Alphafly 3",
            "subtitle": "Men's Road Racing Shoes",
            "category": "running",
            "price": 22795.00,
            "original_price": 24995.00,
            "rating": 4.9,
            "reviews_count": 348,
            "image_url": "/static/images/hero_sneaker.jpg",
            "colorway": "Volt / Electric Cyan / Obsidian",
            "badge": "OLYMPIC ED.",
            "cushion_level": "maximum",
            "arch_support": "high_arch",
            "surface": "road",
            "intensity": "high",
            "description": "Fine-tuned for marathon speed, the Alphafly 3 pushes what you thought was possible in road racing. Dual Air Zoom units combine with ultra-responsive ZoomX foam and a full-length carbon fiber Flyplate to propel you past the finish line.",
            "tech_specs": json.dumps({
                "Weight": "7.7 oz / 218g (Men's size 10)",
                "Heel-to-toe drop": "8 mm",
                "Midsole Foam": "Full ZoomX Foam + Carbon Flyplate",
                "Pod Technology": "Dual Forefoot Air Zoom Pods",
                "Upper Material": "AtomKnit 3.0 Breathable Tech"
            }),
            "sizes": json.dumps([7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13]),
            "features": json.dumps([
                "Integrated continuous ZoomX midsole for smoother transitions",
                "AtomKnit upper delivers multi-directional containment and breathability",
                "Full-length carbon fiber plate tuned for propulsive energy return",
                "Reinforced waffle outsole pattern for aggressive wet-surface grip"
            ]),
            "stock": 18
        },
        {
            "name": "Air Jordan 1 Retro High OG",
            "subtitle": "Men's Iconic Court & Streetwear Sneaker",
            "category": "basketball",
            "price": 16995.00,
            "original_price": 18995.00,
            "rating": 4.9,
            "reviews_count": 892,
            "image_url": "/static/images/basketball_sneaker.jpg",
            "colorway": "Chicago Varsity Red / Black / White",
            "badge": "ICONIC LEGEND",
            "cushion_level": "stable",
            "arch_support": "neutral",
            "surface": "court",
            "intensity": "medium",
            "description": "Familiar yet always fresh, the iconic Air Jordan 1 is remastered for today's sneakerhead culture. Premium full-grain leather, encapsulated Nike Air cushioning, and the timeless Wings logo define hardwood heritage.",
            "tech_specs": json.dumps({
                "Weight": "15.2 oz / 430g",
                "Cushioning": "Encapsulated Air-Sole Heel Unit",
                "Upper": "Genuine Full-Grain Leather & Suede",
                "Traction": "Solid Rubber Cupsole with Deep Flex Grooves",
                "Profile": "High-Top Ankle Support Collar"
            }),
            "sizes": json.dumps([7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]),
            "features": json.dumps([
                "Luxurious tumble grain leather upper with contrast perimeter stitching",
                "Classic high-top collar with padded interior lining",
                "Encapsulated Air unit in heel for lightweight impact protection",
                "Concentrated concentric circle pivot traction for court maneuverability"
            ]),
            "stock": 14
        },
        {
            "name": "Nike Air Max Dn Dynamic",
            "subtitle": "Futuristic Lifestyle / Air Cushion Sneaker",
            "category": "streetwear",
            "price": 13995.00,
            "original_price": 15995.00,
            "rating": 4.8,
            "reviews_count": 215,
            "image_url": "/static/images/streetwear_sneaker.jpg",
            "colorway": "Midnight Obsidian / Hyper Violet / Crimson",
            "badge": "NEW AIR ERA",
            "cushion_level": "maximum",
            "arch_support": "neutral",
            "surface": "street",
            "intensity": "casual",
            "description": "Say hello to the next generation of Air technology. The Air Max Dn features our Dynamic Air unit system of dual-chamber, four-tubed tubes, creating a reactive sensation with every step you take in the city.",
            "tech_specs": json.dumps({
                "Weight": "13.4 oz / 380g",
                "Air System": "Dynamic Air Dual-Chamber Four-Tubes",
                "Upper": "Multi-Layered Textured Mesh with Haptic Print",
                "Midsole": "Sculpted Phylon Carrier Foam",
                "Insole": "Molded OrthoLite Comfort Sockliner"
            }),
            "sizes": json.dumps([7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13]),
            "features": json.dumps([
                "Dual-pressure tubes shift air levels as you strike for fluid transitions",
                "Matte-finish TPU support shank embedded for torsional rigidity",
                "Reflective tongue and heel accents for low-light night visibility",
                "Plush collar lining prevents heel slip and irritation"
            ]),
            "stock": 22
        },
        {
            "name": "Nike Vaporfly 3 Next%",
            "subtitle": "Elite Marathon & Road Racing Shoe",
            "category": "running",
            "price": 20695.00,
            "original_price": 22795.00,
            "rating": 4.9,
            "reviews_count": 412,
            "image_url": "/static/images/marathon_racer.jpg",
            "colorway": "Pure White / Bright Crimson / Solar Red",
            "badge": "FASTEST ROAD SHOE",
            "cushion_level": "responsive",
            "arch_support": "neutral",
            "surface": "road",
            "intensity": "high",
            "description": "Catch 'em if you can. Giving you race-day speed to conquer any distance, the Nike Vaporfly 3 is built for the chasers, the racers, and the elevated pacers who can't turn down the thrill of the pursuit.",
            "tech_specs": json.dumps({
                "Weight": "6.5 oz / 185g (Men's size 9)",
                "Heel-to-toe drop": "8 mm",
                "Plate": "Full-length Flyplate Carbon Fiber",
                "Foam": "Ultra-resilient ZoomX compound",
                "Upper": "Flyknit Engineered Yarn Architecture"
            }),
            "sizes": json.dumps([7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]),
            "features": json.dumps([
                "Sculpted convex heel reduces overall weight while keeping cushioning",
                "Full-length carbon fiber flyplate provides a stiff, propulsive feel",
                "Specifically selected Flyknit yarns bring zones of engineered support",
                "Thinner outsole rubber maintains durability while cutting drag"
            ]),
            "stock": 19
        },
        {
            "name": "Nike Metcon 9 AMP",
            "subtitle": "Men's Workout & Cross-Training Shoes",
            "category": "training",
            "price": 12795.00,
            "original_price": 13995.00,
            "rating": 4.7,
            "reviews_count": 529,
            "image_url": "/static/images/training_sneaker.jpg",
            "colorway": "Matte Slate / Metallic Gold / Electric Volt",
            "badge": "COMMITTED TO GRIND",
            "cushion_level": "stable",
            "arch_support": "flat_feet",
            "surface": "gym",
            "intensity": "high",
            "description": "Whatever your 'why' is for working out, the Metcon 9 makes it all worth it. We improved on the 8 with a larger Hyperlift plate and added rubber rope wrap. Sworn to by some of the greatest athletes in the world.",
            "tech_specs": json.dumps({
                "Weight": "12.8 oz / 363g",
                "Stability Tech": "Expanded Hyperlift Heel Plate",
                "Rope Guard": "Extended Medial Wrap Rubber Outsole",
                "Midsole": "Dual-Density Foam (Firm Heel, Soft Forefoot)",
                "Lace System": "Lace Lock Tab to prevent untying"
            }),
            "sizes": json.dumps([8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13]),
            "features": json.dumps([
                "Hyperlift plate in the heel provides stability for heavy deadlifts and squats",
                "Extended rubber wrap on the side adds durability for rope climbs",
                "Breathable textile upper features haptic print for rugged durability",
                "Dual-density midsole delivers responsive cushioning for cardio sets"
            ]),
            "stock": 30
        },
        {
            "name": "Nike Dunk Low Retro Craft",
            "subtitle": "Classic Men's Streetwear & Heritage Shoes",
            "category": "streetwear",
            "price": 8995.00,
            "original_price": 9995.00,
            "rating": 4.8,
            "reviews_count": 1240,
            "image_url": "/static/images/lifestyle_sneaker.jpg",
            "colorway": "Pure Platinum / Mint Green / Icy Gum",
            "badge": "STREET MUST-HAVE",
            "cushion_level": "balanced",
            "arch_support": "neutral",
            "surface": "street",
            "intensity": "casual",
            "description": "Created for the hardwood but taken to the streets, the '80s icon returns with perfectly aged details and throwback hoops flair. Channeling vintage style back onto the street, its padded collar lets you take your game anywhere in comfort.",
            "tech_specs": json.dumps({
                "Weight": "14.1 oz / 400g",
                "Midsole": "Lightweight Foam Cushioning",
                "Outsole": "Rubber Cupsole with Heritage Hoops Pivot",
                "Upper": "Supple Aniline Leather with Perforated Toe",
                "Collar": "Low-Cut Foam Padded Comfort Collar"
            }),
            "sizes": json.dumps([7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13]),
            "features": json.dumps([
                "Crisp leather upper softens and gains vintage character with wear",
                "Modern foam midsole offers lightweight, responsive cushioning",
                "Padded low-cut collar looks sleek and feels plush around the ankle",
                "Classic pivot circle rubber outsole delivers heritage traction"
            ]),
            "stock": 35
        },
        {
            "name": "Nike Pegasus 41 ReactX",
            "subtitle": "Men's Daily Road Running Shoe",
            "category": "running",
            "price": 11895.00,
            "original_price": 12995.00,
            "rating": 4.8,
            "reviews_count": 670,
            "image_url": "/static/images/hero_sneaker.jpg",
            "colorway": "Electric Cyan / White / Total Orange",
            "badge": "WORKHORSE WITH WINGS",
            "cushion_level": "balanced",
            "arch_support": "neutral",
            "surface": "road",
            "intensity": "medium",
            "description": "Responsive cushioning in the Pegasus delivers an energized ride for everyday road runs. Experience lighter-weight energy return with dual Air Zoom units and an upgraded ReactX foam midsole.",
            "tech_specs": json.dumps({
                "Weight": "9.9 oz / 281g",
                "Heel-to-toe drop": "10 mm",
                "Cushioning": "Upgraded ReactX Foam (13% more energy return)",
                "Units": "Forefoot and Heel Zoom Air Pods",
                "Upper": "Engineered Single Layer Mesh"
            }),
            "sizes": json.dumps([7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]),
            "features": json.dumps([
                "ReactX foam reduces carbon footprint of the midsole by 43%",
                "Dual Zoom Air units at forefoot and heel cushion every impact",
                "Waffle-inspired rubber outsole provides flexible, durable grip",
                "Plush collar, tongue, and sockliner for secure locked-in fit"
            ]),
            "stock": 28
        },
        {
            "name": "Nike G.T. Cut 3 Pro",
            "subtitle": "Men's Greater Than Basketball Shoes",
            "category": "basketball",
            "price": 17495.00,
            "original_price": 19995.00,
            "rating": 4.9,
            "reviews_count": 184,
            "image_url": "/static/images/basketball_sneaker.jpg",
            "colorway": "Black / Crimson Impact / Ghost White",
            "badge": "PRO COURT PICK",
            "cushion_level": "responsive",
            "arch_support": "flat_feet",
            "surface": "court",
            "intensity": "high",
            "description": "How fast can you separate yourself from defenders? In the G.T. Cut 3, step-back jumpers and backdoor cuts feel instant. Equipped with newly added ZoomX foam, it gives you the fastest first step on the hardwood.",
            "tech_specs": json.dumps({
                "Weight": "13.2 oz / 375g",
                "Midsole": "Full-Length ZoomX Foam for maximum spring",
                "Containment": "Modified Flywire Cables integrated with laces",
                "Traction": "Herringbone pods with multidirectional teeth",
                "Lateral Support": "TPU sidewall wrap preventing rollover"
            }),
            "sizes": json.dumps([8, 8.5, 9, 9.5, 10, 10.5, 11, 12]),
            "features": json.dumps([
                "First Nike basketball shoe infused with premier ZoomX foam",
                "Incredible lateral containment stops foot sliding during explosive cuts",
                "Low-profile court feel keeps reaction times laser sharp",
                "Tear-resistant engineered textile keeps weight to an absolute minimum"
            ]),
            "stock": 16
        },
        {
            "name": "Nike Invincible 3 Max Cushion",
            "subtitle": "Men's Maximum Comfort Long Distance Running",
            "category": "running",
            "price": 16995.00,
            "original_price": 18995.00,
            "rating": 4.7,
            "reviews_count": 418,
            "image_url": "/static/images/marathon_racer.jpg",
            "colorway": "Pure Platinum / Laser Orange / Black",
            "badge": "MAX CUSHION KING",
            "cushion_level": "maximum",
            "arch_support": "high_arch",
            "surface": "road",
            "intensity": "high",
            "description": "With maximum cushioning to support every mile, the Invincible 3 gives you our highest level of comfort underfoot to help you stay on your feet today, tomorrow and beyond. Rocker-shaped ZoomX foam absorbs heavy impact effortlessly.",
            "tech_specs": json.dumps({
                "Weight": "10.9 oz / 310g",
                "Stack Height": "40 mm Heel / 31 mm Forefoot",
                "Midsole": "Ultra-thick Rocker ZoomX Foam",
                "Stability": "Wider base geometry at forefoot & heel",
                "Upper": "Evolutionary Flyknit with micro-ventilation"
            }),
            "sizes": json.dumps([8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]),
            "features": json.dumps([
                "Rocker geometry assists effortless roll-through from heel to toe",
                "Massive stack of ZoomX foam provides unmatched shock dissipation",
                "Engineered Flyknit upper is reinforced where your foot needs stability",
                "Waffle traction lugs provide confidence on rain-slicked asphalt"
            ]),
            "stock": 21
        },
        {
            "name": "Nike Air Max Plus Drift",
            "subtitle": "Futuristic Tuned Air Streetwear",
            "category": "streetwear",
            "price": 15995.00,
            "original_price": 17995.00,
            "rating": 4.8,
            "reviews_count": 310,
            "image_url": "/static/images/streetwear_sneaker.jpg",
            "colorway": "Neon Gradient / Cyber Obsidian",
            "badge": "TUNED AIR",
            "cushion_level": "maximum",
            "arch_support": "neutral",
            "surface": "street",
            "intensity": "casual",
            "description": "Bring your attitude edge with the Nike Air Max Plus Drift, a 'tuned' Air experience that offers premium stability and unbelievable cushioning. Featuring airy mesh, bold gradient colorways and distinctive cage lines.",
            "tech_specs": json.dumps({
                "Weight": "14.6 oz / 414g",
                "Tuned Air Units": "Separate forefoot and heel Air bubbles",
                "Cage Support": "Flame-inspired synthetic structural exoskeleton",
                "Outsole": "Rubber with Tuned Air badging on heel",
                "Arch Support": "Whale-tail inspired midfoot arch shank"
            }),
            "sizes": json.dumps([7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]),
            "features": json.dumps([
                "Synthetic cage adds structure and fierce 90s running aesthetics",
                "Nike Tuned Air units deliver responsive lightweight bounce",
                "Breathable textile upper keeps your feet cool all day",
                "Full-length rubber tread provides durable multi-surface traction"
            ]),
            "stock": 15
        },
        {
            "name": "Nike Free Metcon 5",
            "subtitle": "Men's HIIT & Agility Training Shoes",
            "category": "training",
            "price": 9995.00,
            "original_price": 11495.00,
            "rating": 4.6,
            "reviews_count": 280,
            "image_url": "/static/images/training_sneaker.jpg",
            "colorway": "Stealth Carbon / Volt Pop",
            "badge": "HIIT READY",
            "cushion_level": "balanced",
            "arch_support": "flat_feet",
            "surface": "gym",
            "intensity": "medium",
            "description": "When your workouts wade into the nitty-gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out on the other side on a high. Flexibility in forefoot, stability in heel.",
            "tech_specs": json.dumps({
                "Weight": "11.1 oz / 315g",
                "Forefoot Tech": "Nike Free deep laser-siped grooves",
                "Heel Tech": "Wide firm heel base with foam encasement",
                "Upper": "7/8-length stretch bootie collar",
                "Internal Webbing": "Lacing lock down across midfoot"
            }),
            "sizes": json.dumps([8, 8.5, 9, 9.5, 10, 10.5, 11, 12]),
            "features": json.dumps([
                "Nike Free technology in the forefoot creates flexibility for burpees & sprints",
                "Rigid, wide heel creates a stable platform for power lifts",
                "Plush collar surrounds ankle for comfort during quick directional changes",
                "Molded heel clip locks down back of foot during heavy sets"
            ]),
            "stock": 25
        },
        {
            "name": "Nike Air Force 1 '07 LV8 Fresh",
            "subtitle": "Men's Premium Streetwear Classic",
            "category": "streetwear",
            "price": 10795.00,
            "original_price": 11995.00,
            "rating": 4.9,
            "reviews_count": 1420,
            "image_url": "/static/images/lifestyle_sneaker.jpg",
            "colorway": "Triple Summit White / Mint Frost",
            "badge": "ETERNAL CLASSIC",
            "cushion_level": "balanced",
            "arch_support": "neutral",
            "surface": "street",
            "intensity": "casual",
            "description": "Aging gracefully isn't easy, but the Air Force 1 '07 LV8 Fresh comes pretty close. Soft textured leather helps conceal creasing and is easy to clean. The debossed branding, which replaces the woven labels, pairs with extra laces so you can eat that jam donut in peace.",
            "tech_specs": json.dumps({
                "Weight": "15.0 oz / 425g",
                "Cushioning": "Full-length encapsulated Nike Air sole",
                "Upper": "Ultra-soft full grain calfskin leather",
                "Sockliner": "Perforated leather comfort insole",
                "Collar": "Padded low-cut collar"
            }),
            "sizes": json.dumps([7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13]),
            "features": json.dumps([
                "Soft leather is engineered to minimize visible creasing over years of wear",
                "Nike Air cushioning originally designed for performance hoops adds lasting comfort",
                "Debossed branding creates a sleek, high-end minimalist profile",
                "Pivot circle rubber outsole gives you heritage style and traction"
            ]),
            "stock": 40
        }
    ]

    for shoe in shoes_data:
        cursor.execute("""
        INSERT INTO shoes (
            name, subtitle, category, price, original_price, rating, reviews_count,
            image_url, colorway, badge, cushion_level, arch_support, surface, intensity,
            description, tech_specs, sizes, features, stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shoe["name"], shoe["subtitle"], shoe["category"], shoe["price"], shoe["original_price"],
            shoe["rating"], shoe["reviews_count"], shoe["image_url"], shoe["colorway"], shoe["badge"],
            shoe["cushion_level"], shoe["arch_support"], shoe["surface"], shoe["intensity"],
            shoe["description"], shoe["tech_specs"], shoe["sizes"], shoe["features"], shoe["stock"]
        ))

    # Add sample authentic customer reviews for top shoes
    sample_reviews = [
        (1, "Marcus Vance", 5, "Unbelievable PR on my Marathon!", "Ran the Mumbai Marathon in the Alphafly 3. Smashed my previous best by 4 minutes. The energy return from the dual Zoom pods is like having carbon trampolines beneath your feet.", 1),
        (1, "Priya Sharma", 5, "Game changer for high mileage", "The AtomKnit 3 fits like a second skin without any blistering. You feel propelled forward with every stride.", 1),
        (2, "Rohan Kapoor", 5, "The holy grail sneaker", "The leather quality on this retro cut is top tier. Smells like real leather, firm ankle collar, zero heel slip. A timeless grail in India.", 1),
        (3, "Aarav Patel", 5, "Dynamic Air is the future", "Looks straight out of 2050 cyberpunk. The 4 tubes distribute pressure when you walk all day. Super comfy.", 1),
        (4, "Sarah Jenkins", 5, "Featherlight rocket for race day", "Weighs practically nothing. Snapped my 10k PR on the first weekend. Best racing shoe on the market.", 1),
        (5, "Vikram Malhotra", 5, "Rock solid for heavy deadlifts", "The Hyperlift heel does not budge under 180kg squats. Rope wrap also holds up perfectly on crossfit days.", 1),
        (6, "Neha Iyer", 5, "Everyday perfection", "Goes with literally any outfit. Jeans, cargo, shorts. Clean leather and super comfortable inside.", 1)
    ]

    for rev in sample_reviews:
        cursor.execute("""
        INSERT INTO reviews (shoe_id, user_name, rating, title, comment, verified)
        VALUES (?, ?, ?, ?, ?, ?)
        """, rev)

    conn.commit()
    conn.close()
    print("Database updated with Users table, INR pricing (INR / Rs), and seeded catalog!")

if __name__ == '__main__':
    init_db()
