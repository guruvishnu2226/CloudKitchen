from db import get_db_connection
import os

def setup_database():
    print("🚀 Starting full database setup...")
    
    # 1. Open the connection
    connection = get_db_connection()
    if not connection:
        print("❌ Could not connect to the database. Stopping setup.")
        return
    
    cursor = connection.cursor()

    # ==========================================
    # 1. MENU ITEMS
    # ==========================================
    print("\n--- Setting up menu_items table ---")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            category VARCHAR(100),
            image_url VARCHAR(500)
        )
    """)
    
    menu_data = [
        (1, 'Masala Dosa', 60, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887284/masaladosa_juoguk.jpg'),
        (2, 'Idly', 10, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887276/idly_q2adwm.jpg'),
        (3, 'Sambar Idly', 40, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887302/sambar_idly_o9xsqt.jpg'),
        (5, 'Mutton Briyani', 200, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887288/Mutton_Biryani_ntujx1.jpg'),
        (6, 'Chicken Briyani', 150, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887191/chicken_briyani_jzfx6g.jpg'),
        (7, 'Naan', 25, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887293/naan_m38fpl.jpg'),
        (8, 'Butter Naan', 30, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887183/butter_naan_mt6eac.jpg'),
        (9, 'Garlic Naan', 30, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887242/garlic_naan_zsal2p.jpg'),
        (10, 'Butter Garlic Naan', 35, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887161/butter_garlic_naan_qrxlho.jpg'),
        (11, 'Butter Chicken', 180, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887167/butter_chicken_q1yisn.jpg'),
        (12, 'Panner Tikka Masala', 150, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887291/panner_tikka_masala_faentr.jpg'),
        (13, 'Dhal Makhani', 120, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887224/Dal_Makhani_ackvlq.jpg'),
        (14, 'Egg Curry', 60, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887240/Egg_Curry_id4tl2.jpg'),
        (15, 'Egg Bhurji', 80, 'North Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887235/egg_bhurji_u37dvf.jpg'),
        (16, 'Grilled Lemon Herb Chicken', 280, 'Continental', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887245/grilled_lemon_herb_chicken_jpswgt.jpg'),
        (17, 'Fish and Chips', 260, 'Continental', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887238/fish_and_chips_c9xcya.jpg'),
        (18, 'Veg Au Gratin', 200, 'Continental', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887304/veg_au_gratin_zn34yx.jpg'),
        (19, 'Roasted Garlic Mashed Potatoes', 120, 'Continental', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887296/rosted_garlic_mashed_potetoes_sntnkl.jpg'),
        (20, 'Margherita Pizza', 250, 'Italian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887282/margeritta_pizza_b9vhyx.jpg'),
        (21, 'Spaghetti Carbonara', 280, 'Italian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887306/Spaghetti_Carbonara_yl5kyx.jpg'),
        (22, 'Mushroom Risotto', 240, 'Italian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887286/mushroom_rissotto_bjjmr8.jpg'),
        (23, 'Garlic Bread with Cheese', 110, 'Italian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887244/garlic_bread_with_cheese_pccytu.jpg'),
        (24, 'Classic Cheeseburger', 150, 'American', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887218/classic_cheese_burger_d9m0bg.jpg'),
        (25, 'Buffalo Chicken Wings', 200, 'American', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887155/buffalo_chicken_wings_dvwagy.jpg'),
        (26, 'Macaroni and Cheese', 170, 'American', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887279/macroni_and_cheese_l0vhv0.jpg'),
        (27, 'BBQ Pork Ribs', 350, 'American', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887140/BBQ_pork_ribs_sp1t8b.jpg'),
        (28, 'Dosa', 40, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887233/dosa_t8lmsd.jpg'),
        (29, 'Pongal', 50, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887297/pongal_gsrfn7.jpg'),
        (30, 'Vadai', 10, 'South Indian', 'https://res.cloudinary.com/drlhguylt/image/upload/v1775887300/vadai_fgeerb.jpg')
    ]

    insert_menu_query = """
        INSERT INTO menu_items (id, item_name, price, category, image_url)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        cursor.executemany(insert_menu_query, menu_data)
        print(f"✅ Inserted {cursor.rowcount} menu items.")
    except Exception as e:
        print(f"⚠️ Error inserting menu items (they might already exist): {e}")

    # ==========================================
    # 2. ORDERS
    # ==========================================
    print("\n--- Setting up orders table ---")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INT PRIMARY KEY,
            order_type VARCHAR(50) NOT NULL,
            items JSON NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) NOT NULL,
            created_at DATETIME NOT NULL,
            finished_at DATETIME
        )
    """)

    orders_data = [
        (1, 'dine_in', '[{"quantity": 1, "item_name": "Classic Cheeseburger", "unit_price": 150.0, "total_for_item": 150.0}, {"quantity": 2, "item_name": "Naan", "unit_price": 25.0, "total_for_item": 50.0}, {"quantity": 1, "item_name": "Egg Curry", "unit_price": 60.0, "total_for_item": 60.0}]', 260.00, 'delivered/served', '2026-04-09 16:59:14', '2026-04-09 17:01:44'),
        (2, 'takeaway', '[{"quantity": 1, "item_name": "Fish and Chips", "unit_price": 260.0, "total_for_item": 260.0}]', 260.00, 'delivered/served', '2026-04-09 17:00:31', '2026-04-09 17:02:09'),
        (3, 'dine_in', '[{"quantity": 3, "item_name": "Idly", "unit_price": 10.0, "total_for_item": 30.0}]', 30.00, 'delivered/served', '2026-04-09 17:13:18', '2026-04-09 17:14:34'),
        (4, 'dine_in', '[{"quantity": 1, "item_name": "Veg Au Gratin", "unit_price": 200.0, "total_for_item": 200.0}]', 200.00, 'delivered/served', '2026-04-09 17:18:43', '2026-04-09 17:38:39'),
        (5, 'dine_in', '[{"quantity": 1, "item_name": "Dhal Makhani", "unit_price": 120.0, "total_for_item": 120.0}, {"quantity": 2, "item_name": "Naan", "unit_price": 25.0, "total_for_item": 50.0}]', 170.00, 'delivered/served', '2026-04-09 17:58:48', '2026-04-09 17:59:45'),
        (6, 'takeaway', '[{"quantity": 1, "item_name": "Mushroom Risotto", "unit_price": 240.0, "total_for_item": 240.0}]', 240.00, 'delivered/served', '2026-04-09 17:59:02', '2026-04-09 18:00:00'),
        (7, 'delivery', '[{"quantity": 1, "item_name": "Classic Cheeseburger", "unit_price": 150.0, "total_for_item": 150.0}]', 150.00, 'delivered/served', '2026-04-09 17:59:20', '2026-04-09 18:00:03'),
        (8, 'dine_in', '[{"quantity": 1, "item_name": "Macaroni and Cheese", "unit_price": 170.0, "total_for_item": 170.0}]', 170.00, 'delivered/served', '2026-04-11 16:47:46', '2026-04-11 16:48:21')
    ]

    insert_orders_query = """
        INSERT INTO orders (id, order_type, items, total_price, status, created_at, finished_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.executemany(insert_orders_query, orders_data)
        print(f"✅ Inserted {cursor.rowcount} past orders.")
    except Exception as e:
        print(f"⚠️ Error inserting orders (they might already exist): {e}")

    # ==========================================
    # 3. STAFF (Updated with real passwords!)
    # ==========================================
    print("\n--- Setting up staff table ---")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at DATETIME NOT NULL
        )
    """)

    staff_data = [
        (1, 'chef1', os.getenv("CHEF_HASH"), 'kitchen', '2026-04-10 11:00:23'),
        (2, 'manager1', os.getenv("MANAGER_HASH"), 'admin', '2026-04-10 11:00:23')
    ]

    insert_staff_query = """
        INSERT INTO staff (id, username, password_hash, role, created_at)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        cursor.executemany(insert_staff_query, staff_data)
        print(f"✅ Inserted {cursor.rowcount} staff accounts.")
    except Exception as e:
        print(f"⚠️ Error inserting staff (they might already exist): {e}")

    # ==========================================
    # FINISH
    # ==========================================
    connection.commit()
    print("\n🎉 ALL DONE! Your Aiven database is fully built and ready to go.")

    cursor.close()
    connection.close()

if __name__ == "__main__":
    setup_database()