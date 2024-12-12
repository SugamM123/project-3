from flask import Flask, request, jsonify, session
import requests
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
from pathlib import Path
from dotenv import load_dotenv
import openai
import os
import hashlib
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleAuthRequest
from datetime import datetime
from collections import defaultdict


app = Flask(__name__)
CORS(app, origins=["https://project-3-team-0g-frontend.onrender.com", "http://localhost:3000"])

load_dotenv()


def hash_password(password):
    digest = hashlib.sha256()
    digest.update(password.encode('utf-8'))
    hashed_password = digest.hexdigest()

    return hashed_password

db_user = os.getenv("USER")
db_password = os.getenv("PASSWORD")
db_host = os.getenv("HOST")
db_port = os.getenv("PG_PORT")
db_name = os.getenv("DATABASE_NAME")

openai_key = os.getenv("OPENAI_API_KEY")

CLIENT_ID = os.getenv("GOOGLE_AUTH_CLIENT_ID")

google_translate_api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")

openai.api_key = openai_key

def get_db_connection():
    try:
        conn = psycopg2.connect(
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            database=db_name
        )
        return conn
    except Exception as e:
        print("Error connecting to the database:", e)
        return None

@app.route('/', methods=['GET'])
def hello():
    return jsonify({"message":"Welcome to Panda Express"})

@app.route("/db-connect", methods=['GET'])
def get_connection():
    cn = get_db_connection()
    if cn:
        return jsonify({"message": "Database connection successful"}), 200
    else:
        return jsonify({"message": "Database connection failed"}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get("messages", [])

    conversation = []
    for message in messages:
        role = "user" if message["sender"] == "user" else "assistant"
        conversation.append({"role": role, "content": message["text"]})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversation
        )
        reply = response['choices'][0]['message']['content']
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"error with open ai": str(e)}), 500

@app.route('/inventory-restock-info', methods=['GET'])
def get_restock_info():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.name AS ingredient_name,
                    i.quantity AS current_quantity,
                    COALESCE(SUM(ii.quantity_needed), 0) AS total_quantity_needed,
                    CASE
                        WHEN i.quantity <= COALESCE(SUM(ii.quantity_needed), 0)
                        THEN 1 - (i.quantity / NULLIF(COALESCE(SUM(ii.quantity_needed), 1), 0))
                        ELSE COALESCE(SUM(ii.quantity_needed), 0) / NULLIF(i.quantity, 0)
                    END AS priority_score
                FROM 
                    inventory i
                LEFT JOIN 
                    item_ingredients ii ON i.name = ii.ingredient_name
                GROUP BY 
                    i.name, i.quantity
                ORDER BY 
                    priority_score DESC;
            """)

            result = cursor.fetchall()

            restock_info = []
            for row in result:
                restock_info.append({
                    "ingredient_name": row[0],
                    "current_quantity": float(row[1]), 
                    "total_quantity_needed": float(row[2]),
                    "priority_score": float(row[3]) 
                })

            return jsonify(restock_info), 200
    except Exception as e:
        print("Error fetching restock information:", e)
        return jsonify({"message": "An error occurred while fetching restock information"}), 500
    finally:
        conn.close()

@app.route('/mass-inventory-update', methods=['POST'])
def update_inventory():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        data = request.json
        updates = data.get("updates", [])

        if not updates or not isinstance(updates, list):
            return jsonify({"message": "Invalid input format. 'updates' should be a list."}), 400

        with conn.cursor() as cursor:
            for update in updates:
                name = update.get("name")
                quantity = update.get("quantity")

                if not name or quantity is None: 
                    return jsonify({"message": "Each update must include 'name' and 'quantity'."}), 400

                cursor.execute("""
                    UPDATE inventory
                    SET quantity = %s
                    WHERE name = %s
                """, (quantity, name))

            conn.commit()

        return jsonify({"message": "Inventory updated successfully."}), 200

    except Exception as e:
        print("Error updating inventory:", e)
        return jsonify({"message": "An error occurred while updating inventory"}), 500
    finally:
        conn.close()

@app.route('/get-translation', methods=['POST'])
def get_translated_word():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        data = request.json
        english_word = data.get("en")

        if not english_word:
            return jsonify({"message": "Invalid English word"}), 400

        with conn.cursor() as cursor:
            cursor.execute(
                sql.SQL("SELECT es FROM translations WHERE en = %s"),
                (english_word,)
            )
            spanish_word_record = cursor.fetchone()

            if spanish_word_record:
                spanish_word = spanish_word_record[0]
                return jsonify({"es": spanish_word}), 200
            else:
                url = f"https://translation.googleapis.com/language/translate/v2?key={google_translate_api_key}"
                payload = {
                    "q": english_word,
                    "target": "es",
                    "format": "text"
                }
                print("Google translate api called")
                response = requests.post(url, json=payload)

                if response.status_code == 200:
                    translated_text = response.json()["data"]["translations"][0]["translatedText"]

                    cursor.execute(
                        sql.SQL("INSERT INTO translations (en, es) VALUES (%s, %s)"),
                        (english_word, translated_text)
                    )
                    conn.commit()

                    return jsonify({"es": translated_text}), 200
                else:
                    return jsonify({
                        "error": "Translation failed",
                        "details": response.json()
                    }), response.status_code

    except Exception as e:
        print("Error getting or adding translation:", e)
        return jsonify({"message": "An error occurred while processing translation"}), 500
    finally:
        conn.close()


@app.route('/verify-login', methods=['POST'])
def verify_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    hashed_password = hash_password(password)

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500
    
    try:
        with conn.cursor() as cursor:
            
            cursor.execute(
                sql.SQL("SELECT * FROM employees WHERE email = %s AND pass_hash = %s"),
                (email, hashed_password)
            )
            user = cursor.fetchone()

            if user:
                user_data = {
                    "id": user[0],
                    "first_name": user[1],
                    "last_name": user[2],
                    "email": user[3],
                    "phone_number": user[4],
                    "is_manager": user[5],
                }
                return jsonify(user_data), 200
            else:
                return jsonify(None), 401
    except Exception as e:
        print("Error during login query:", e)
        return jsonify({"message": "An error occurred"}), 500
    finally:
        conn.close()

@app.route("/google-login", methods=["POST"])
def google_login():
    connection = None

    try:
        connection = get_db_connection()

        data = request.get_json()
        token = data.get("token")
        if not token:
            return jsonify({"error": "Missing token"}), 400

        idinfo = id_token.verify_oauth2_token(token, GoogleAuthRequest(), CLIENT_ID)
        google_user_id = idinfo["sub"]

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, first_name, last_name, email, phone_number, is_manager "
                "FROM employees WHERE google_id = %s",
                (google_user_id,),
            )
            user = cursor.fetchone()

            if user:
                user_data = {
                    "id": user[0],
                    "first_name": user[1],
                    "last_name": user[2],
                    "email": user[3],
                    "phone_number": user[4],
                    "is_manager": user[5],
                }
                return jsonify(user_data), 200
            else:
                return jsonify({"error": "Google user not registered"}), 404

    except ValueError as e:
        print("Invalid token:", str(e))
        return jsonify({"error": "Invalid token"}), 401

    except psycopg2.Error as db_error:
        print("Database error:", str(db_error))
        return jsonify({"error": "Database error"}), 500

    finally:
        if connection:
            connection.close()

@app.route('/employees', methods=['GET'])
def get_employees():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, first_name, last_name, email, phone_number, is_manager FROM employees")
            employees = cursor.fetchall()

            employee_list = []
            for employee in employees:
                employee_list.append({
                    "id": employee[0],
                    "first_name": employee[1],
                    "last_name": employee[2],
                    "email": employee[3],
                    "phone_number": employee[4],
                    "is_manager": employee[5]
                })

            return jsonify(employee_list), 200
    except Exception as e:
        print("Error fetching employees:", e)
        return jsonify({"message": "An error occurred while fetching employees"}), 500
    finally:
        conn.close()

@app.route('/employees', methods=['POST'])
def add_employee():
    data = request.get_json()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    is_manager = data.get('is_manager', False)
    password = data.get('password')
    google_id = data.get('google_id', None)

    print(data)

    if not all([first_name, last_name, email, phone_number, password]) and not (all([first_name, last_name, email, phone_number, google_id])):
        return jsonify({"message": "All fields except 'is_manager' are required."}), 400

    hashed_password = hash_password(password)

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                sql.SQL("""
                    INSERT INTO employees (first_name, last_name, email, phone_number, is_manager, pass_hash, google_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """),
                (first_name, last_name, email, phone_number, is_manager, hashed_password, google_id)
            )
            conn.commit()
            return jsonify({"message": "Employee added successfully"}), 201
    except Exception as e:
        print("Error adding employee:", e)
        return jsonify({"message": "An error occurred while adding the employee"}), 500
    finally:
        conn.close()

@app.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    data = request.get_json()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    is_manager = data.get('is_manager')
    password = data.get('password')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            update_fields = []
            update_values = []

            if first_name:
                update_fields.append("first_name = %s")
                update_values.append(first_name)

            if last_name:
                update_fields.append("last_name = %s")
                update_values.append(last_name)

            if email:
                update_fields.append("email = %s")
                update_values.append(email)

            if phone_number:
                update_fields.append("phone_number = %s")
                update_values.append(phone_number)

            if is_manager is not None:
                update_fields.append("is_manager = %s")
                update_values.append(is_manager)

            if password:
                hashed_password = hash_password(password)
                update_fields.append("pass_hash = %s")
                update_values.append(hashed_password)

            update_values.append(employee_id)

            if not update_fields:
                return jsonify({"message": "No fields to update"}), 400

            query = sql.SQL("""
                UPDATE employees
                SET {fields}
                WHERE id = %s
            """).format(fields=sql.SQL(", ").join(map(sql.SQL, update_fields)))

            cursor.execute(query, update_values)
            conn.commit()

            return jsonify({"message": "Employee updated successfully"}), 200
    except Exception as e:
        print("Error updating employee:", e)
        return jsonify({"message": "An error occurred while updating the employee"}), 500
    finally:
        conn.close()

@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                sql.SQL("""
                    DELETE FROM employees
                    WHERE id = %s
                """),
                (employee_id,)
            )
            conn.commit()

            return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        print("Error deleting employee:", e)
        return jsonify({"message": "An error occurred while deleting the employee"}), 500
    finally:
        conn.close()

@app.route('/modify-prices', methods=["PUT"])
def modify_prices():
    """
    JSON body example:

    [
        {
            "name": "a la carte s",
            "price": 21.99
        },
        {
            "name": "a la carte m",
            "price": 12.00
        }
    ]
    """

    data = request.get_json()
    conn = get_db_connection()
    
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500
    
    try:
        cursor = conn.cursor()

        for item in data:
            name = item.get("name")
            price = item.get("price")

            if name and price is not None:
                cursor.execute(
                    sql.SQL("UPDATE prices SET price = %s WHERE name = %s"),
                    (price, name)
                )

        conn.commit()
        return jsonify({"message": "Prices updated successfully"}), 200

    except Exception as e:
        print("Error during price update:", e)
        conn.rollback()
        return jsonify({"message": "An error occurred during the update"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/view-prices', methods=["GET"])
def view_prices():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500
    
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT name, price FROM prices")
        rows = cursor.fetchall()

        prices = [{"name": row[0], "price": row[1]} for row in rows]

        return jsonify(prices), 200

    except Exception as e:
        print("Error during fetching prices:", e)
        return jsonify({"message": "An error occurred while fetching prices"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/submit-order", methods=["POST"])
def submit_order():
    """
    Expected JSON body:
    {
        "customer_name": "alex",
        "order_date": "2024-02-10 10:00:00",
        "employee_id": 2,
        "total_price": 35.50,
        "items": [
            {
                "meal_type": "bowl",
                "meal_items": [
                    {"item_name": "Orange Chicken"},
                    {"item_name": "Fried Rice"}
                ]
            }
        ]
    }
    """
    data = request.get_json()

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        cursor = conn.cursor()

        employee_id = data.get("employee_id", None)

        cursor.execute(
            """
            INSERT INTO orders (customer_name, order_date, employee_id, total_price)
            VALUES (%s, %s, %s, %s) RETURNING id
            """,
            (data["customer_name"], data["order_date"], employee_id, data["total_price"])
        )
        order_id = cursor.fetchone()[0]

        ingredient_usage = {}

        for meal in data["items"]:
            cursor.execute(
                """
                INSERT INTO meals (order_id, meal_type)
                VALUES (%s, %s) RETURNING id
                """,
                (order_id, meal["meal_type"])
            )
            meal_id = cursor.fetchone()[0]

            for item in meal["meal_items"]:
                item_name = item["item_name"]

                cursor.execute(
                    """
                    INSERT INTO meal_item (meal_id, item_name)
                    VALUES (%s, %s)
                    """,
                    (meal_id, item_name)
                )

                cursor.execute(
                    """
                    SELECT ingredient_name, quantity_needed
                    FROM item_ingredients
                    WHERE item_name = %s
                    """,
                    (item_name,)
                )
                ingredients = cursor.fetchall()

                for ingredient_name, quantity_needed in ingredients:
                    if ingredient_name in ingredient_usage:
                        ingredient_usage[ingredient_name] += quantity_needed
                    else:
                        ingredient_usage[ingredient_name] = quantity_needed

        for ingredient_name, total_needed in ingredient_usage.items():
            cursor.execute(
                """
                SELECT quantity FROM inventory
                WHERE name = %s
                """,
                (ingredient_name,)
            )
            result = cursor.fetchone()
            if result is None:
                conn.rollback()
                print("ingredient not found in inventory")
                return jsonify({"message": f"Ingredient '{ingredient_name}' not found in inventory."}), 400
            available_quantity = result[0]

            # prevents ordering if not enough inventory
            # if available_quantity < total_needed:
            #     conn.rollback()
            #     print("insuffient inventory:", ingredient_name, "need:", total_needed, "have:", available_quantity)
            #     return jsonify({"message": f"Not enough '{ingredient_name}' in inventory. Required: {total_needed}, Available: {available_quantity}"}), 400

            cursor.execute(
                """
                UPDATE inventory
                SET quantity = quantity - %s
                WHERE name = %s
                """,
                (total_needed, ingredient_name)
            )

        conn.commit()
        return jsonify({"message": "Order submitted successfully and inventory updated", "order_id": order_id}), 201

    except Exception as e:
        print("Error during order submission:", e)
        conn.rollback()
        return jsonify({"message": "An error occurred while submitting the order"}), 500

    finally:
        cursor.close()
        conn.close()



@app.route("/add-menu-item", methods=["POST"])
def add_menu_item():
    """
    Expected JSON body:
    {
        "name": "PREMIUM hot chicken",
        "type": "entree"
    }
    """
    data = request.get_json()
    name = data.get("name")
    item_type = data.get("type")

    if not name or not item_type:
        return jsonify({"message": "Missing 'name' or 'type' in request body"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO items (name, type)
            VALUES (%s, %s)
            """,
            (name, item_type)
        )

        conn.commit()
        return jsonify({"message": "Menu item added successfully"}), 201

    except Exception as e:
        print("Error during menu item creation:", e)
        conn.rollback()
        return jsonify({"message": "An error occurred while creating the menu item"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/inventory', methods=['GET'])
def get_inve(): ## call for getting inv
    connect = get_db_connection() ## database connection
    if connect is None:
        return jsonify({"message": "Database error"}), 500 ## if cant connect
    try:
        with connect.cursor() as cursor:
            cursor.execute("SELECT name, quantity, unit FROM inventory ORDER BY name ASC") ## ordering by alphabetical order of name query
            inve = cursor.fetchall()
            return jsonify([{"name": item[0], "quantity": item[1], "unit": item[2]} for item in inve]), 200 ## return from call
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error"}), 500 ## throw exceptions
    finally:
        connect.close() ## close connection
        
@app.route('/inventory', methods=['POST'])
def add_inve(): ## call for adding inv
    datainfo = request.get_json() ## requesting
    qty = datainfo.get('quantity') ## set to variable representing quanity
    name = datainfo.get('name') ## same for name and units
    unit = datainfo.get('unit') 
    connect = get_db_connection()
    if connect is None:
        return jsonify({"message": "Database error"}), 500
    try:
        with connect.cursor() as cursor:
            cursor.execute(
                "INSERT INTO inventory (name, quantity, unit) VALUES (%s, %s, %s)", ## Query for adding
                (name, qty, unit))
            connect.commit()
            return jsonify({"message": "Added "}), 201
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error"}), 500
    finally:
        connect.close()

@app.route('/inventory/<string:name>', methods=['PUT'])
def updt_inve(name): ## call for updating
    datainfo = request.get_json() ## using variable for request
    unit = datainfo.get('unit')
    qty = datainfo.get('quantity')
    connect = get_db_connection()
    if connect is None:
        return jsonify({"message": "Database error"}), 500
    try:
        with connect.cursor() as cursor:
            cursor.execute(
                "UPDATE inventory SET quantity = %s, unit = %s WHERE name = %s", ## query for updating
                (qty, unit, name)) 
            connect.commit()
            return jsonify({"message": "Updated"}), 200
    except Exception as e:
        print("error:", e)
        return jsonify({"message": "error"}), 500
    finally:
        connect.close()
@app.route('/inventory/<string:name>', methods=['DELETE'])
def del_inve(name): ## call for deleting
    connect = get_db_connection()
    if connect is None:
        return jsonify({"message": "error"}), 500
    try:
        with connect.cursor() as cursor:
            cursor.execute("DELETE FROM inventory WHERE name = %s", (name,)) ## query for deleting
            connect.commit()
            return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        print("error:", e)
        return jsonify({"message": "error"}), 500
    finally:
        connect.close()
        
@app.route('/get-customer-prices', methods=['GET'])
def get_customer_prices():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT name, price FROM prices")
            items = cursor.fetchall()
            
            prices = {
                "Combo": {
                    "Bowl": 0,
                    "Plate": 0,
                    "Bigger Plate": 0,
                    "premiumUpcharge": 1.50
                },
                "A la Carte": {
                    "regular": {"Small": 0, "Medium": 0, "Large": 0},
                    "premium": {"Small": 0, "Medium": 0, "Large": 0}
                },
                "Appetizers": {"Small": 0, "Large": 0},
                "Drinks": {"Small": 0, "Medium": 0, "Large": 0}
            }
            
            # Map database names to price structure
            for item in items:
                name, price = item
                if name == 'base_bowl':
                    prices['Combo']['Bowl'] = float(price)
                elif name == 'base_plate':
                    prices['Combo']['Plate'] = float(price)
                elif name == 'base_bigger_plate':
                    prices['Combo']['Bigger Plate'] = float(price)
                elif name == 'premium_upcharge':
                    prices['Combo']['premiumUpcharge'] = float(price)
                elif name == 'ala s reg':
                    prices['A la Carte']['regular']['Small'] = float(price)
                elif name == 'ala m reg':
                    prices['A la Carte']['regular']['Medium'] = float(price)
                elif name == 'ala l reg':
                    prices['A la Carte']['regular']['Large'] = float(price)
                elif name == 'ala s prem':
                    prices['A la Carte']['premium']['Small'] = float(price)
                elif name == 'ala m prem':
                    prices['A la Carte']['premium']['Medium'] = float(price)
                elif name == 'ala l prem':
                    prices['A la Carte']['premium']['Large'] = float(price)
                elif name == 'appetizer s':
                    prices['Appetizers']['Small'] = float(price)
                elif name == 'appetizer l':
                    prices['Appetizers']['Large'] = float(price)
                elif name == 'ftn drk s':
                    prices['Drinks']['Small'] = float(price)
                elif name == 'ftn drk m':
                    prices['Drinks']['Medium'] = float(price)
                elif name == 'ftn drk l':
                    prices['Drinks']['Large'] = float(price)
            
            return jsonify(prices)
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        conn.close()

@app.route("/menu-items", methods=["GET"])
def get_menu_items():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        cursor = conn.cursor()

        cursor.execute("SELECT name, type FROM items")
        rows = cursor.fetchall()

        items = [{"name": row[0], "type": row[1]} for row in rows]

        return jsonify(items), 200

    except Exception as e:
        print("Error fetching menu items:", e)
        return jsonify({"message": "An error occurred while fetching menu items"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/get-sales-trends', methods=['GET'])
def get_sales_trends():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    item_name = request.args.get('item_name', '')

    if not start_date or not end_date:
        return jsonify({"message": "Start and end dates are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query for sales trends
        query = """
            SELECT o.order_date::date AS order_day, mi.item_name, COUNT(DISTINCT o.id) AS order_count
            FROM orders o
            JOIN meals m ON o.id = m.order_id
            JOIN meal_item mi ON m.id = mi.meal_id
            WHERE o.order_date BETWEEN %s AND %s
        """
        if item_name:
            query += " AND mi.item_name = %s"

        query += """
            GROUP BY o.order_date::date, mi.item_name
            ORDER BY o.order_date::date, mi.item_name
        """
        
        params = [start_date, end_date]
        if item_name:
            params.append(item_name)

        cursor.execute(query, params)
        results = cursor.fetchall()

        # Structure the data for frontend
        data = {}
        for row in results:
            order_day = row[0]
            item_name = row[1]
            order_count = row[2]

            if item_name not in data:
                data[item_name] = []
            data[item_name].append({'date': order_day, 'count': order_count})

        return jsonify(data)
    
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    finally:
        conn.close()

# Route for X-Report (Hourly Sales Data)
@app.route('/get-x-report', methods=['GET'])
def get_x_report():
    # Use current date if report_date is not provided
    report_date = request.args.get('report_date', default=datetime.now().strftime('%Y-%m-%d'))  # Default to today
    up_to_hour = request.args.get('up_to_hour', type=int)  # Hour limit as an integer

    if not report_date or not up_to_hour:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query for X-Report (hourly sales)
        query = """
            SELECT order_date, total_price
            FROM orders
            WHERE order_date::date = %s
            AND EXTRACT(HOUR FROM order_date) < %s
        """
        cursor.execute(query, [report_date, up_to_hour])
        results = cursor.fetchall()

        # Aggregate results by hour
        hourly_sales = defaultdict(lambda: {"totalOrders": 0, "orderValue": 0.0})

        for row in results:
            order_hour = row[0].hour  # Assuming `row[0]` is a timestamp
            total_price = float(row[1])  # Convert Decimal to float
            hourly_sales[order_hour]["totalOrders"] += 1
            hourly_sales[order_hour]["orderValue"] += total_price

        # Prepare data for frontend
        data = {
            "hourly_sales": [
                {"hour": hour, "totalOrders": values["totalOrders"], "orderValue": values["orderValue"]}
                for hour, values in sorted(hourly_sales.items())
            ]
        }

        return jsonify(data)

    except Exception as e:
        return jsonify({"message": str(e)}), 500
    finally:
        conn.close()

# Route for Z-Report (Total Sales per Day or Item)
@app.route('/get-z-report', methods=['GET'])
def get_z_report():
    # Use current date if report_date is not provided
    report_date = request.args.get('report_date', default=datetime.now().strftime('%Y-%m-%d'))  # Default to today
    up_to_hour = request.args.get('up_to_hour', type=int)  # Hour limit as an integer

    if not report_date or not up_to_hour:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query for X-Report (hourly sales)
        query = """
            SELECT order_date, total_price
            FROM orders
            WHERE order_date::date = %s
            AND EXTRACT(HOUR FROM order_date) < %s
        """
        cursor.execute(query, [report_date, up_to_hour])
        results = cursor.fetchall()

        # Aggregate results by hour
        hourly_sales = defaultdict(lambda: {"totalOrders": 0, "orderValue": 0.0})

        for row in results:
            order_hour = row[0].hour  # Assuming `row[0]` is a timestamp
            total_price = float(row[1])  # Convert Decimal to float
            hourly_sales[order_hour]["totalOrders"] += 1
            hourly_sales[order_hour]["orderValue"] += total_price

        # Prepare data for frontend
        data = {
            "hourly_sales": [
                {"hour": hour, "totalOrders": values["totalOrders"], "orderValue": values["orderValue"]}
                for hour, values in sorted(hourly_sales.items())
            ]
        }

        return jsonify(data)

    except Exception as e:
        return jsonify({"message": str(e)}), 500
    finally:
        conn.close()

@app.route('/get-productusage', methods=['GET'])
def get_productusage():
    start_date = request.args.get('start_date') 
    end_date = request.args.get('end_date')
    if not end_date or not start_date:
        return jsonify({"message": "error"}), 400
    try:
        connection = get_db_connection()  # Database connection
        if connection is None:
            raise Exception("error")
        cursor = connection.cursor()
        query = """
            SELECT ii.ingredient_name,
                   SUM(ii.quantity_needed) AS total_used
            FROM orders o
            LEFT JOIN meals m ON o.id = m.order_id
            LEFT JOIN meal_item mi ON mi.meal_id = m.id
            LEFT JOIN item_ingredients ii ON mi.item_name = ii.item_name
            WHERE o.order_date BETWEEN %s AND %s
            GROUP BY ii.ingredient_name
            ORDER BY ii.ingredient_name;
        """
        cursor.execute(query, (start_date + " 00:00:00", end_date + " 00:00:00"))
        data = cursor.fetchall()
        result = [{"ingredient_name": row[0], "total_used": row[1]} for row in data]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "error", "error": str(e)}), 500
    finally:
        if connection:
            connection.close()
   
  
  
@app.route('/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        page = int(request.args.get('page', 0))
        limit = int(request.args.get('limit', 10))
        offset = page * limit

        customer_filter = request.args.get('customer', '')
        date_filter = request.args.get('date', '')
        employee_filter = request.args.get('employee', '')
        price_filter = request.args.get('price', '')

        with conn.cursor() as cursor:
            query = """
                SELECT 
                    o.id,  -- Include the order ID
                    o.customer_name, 
                    o.order_date, 
                    e.first_name AS employee_first_name, 
                    e.last_name AS employee_last_name, 
                    o.total_price 
                FROM orders o
                JOIN employees e ON o.employee_id = e.id
                WHERE o.customer_name ILIKE %s
                  AND (TO_CHAR(o.order_date, 'MM/DD/YYYY HH24:MI:SS') ILIKE %s
                       OR TO_CHAR(o.order_date, 'YYYY-MM-DD') ILIKE %s)
                  AND (e.first_name || ' ' || e.last_name) ILIKE %s
                  AND CAST(o.total_price AS TEXT) ILIKE %s
                ORDER BY o.order_date DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (
                f"%{customer_filter}%",
                f"%{date_filter}%",
                f"%{date_filter}%",
                f"%{employee_filter}%",
                f"%{price_filter}%",
                limit,
                offset
            ))
            orders = cursor.fetchall()
            result = [
                {
                    "id": order[0],
                    "customer_name": order[1],
                    "order_date": order[2],
                    "employee_first_name": order[3],
                    "employee_last_name": order[4],
                    "total_price": order[5]
                }
                for order in orders
            ]
            return jsonify({"orders": result}), 200
    except Exception as e:
        print("Error fetching orders:", e)
        return jsonify({"message": "An error occurred while fetching orders"}), 500
    finally:
        conn.close()

@app.route('/orders/<int:order_id>/details', methods=['GET'])
def get_order_details(order_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT m.meal_type, mi.item_name
                FROM meals m
                JOIN meal_item mi ON m.id = mi.meal_id
                WHERE m.order_id = %s
            """, (order_id,))
            results = cursor.fetchall()

            meal_details = {}
            for meal_type, item_name in results:
                if meal_type not in meal_details:
                    meal_details[meal_type] = []
                meal_details[meal_type].append(item_name)

            formatted_details = [{"meal_type": key, "items": value} for key, value in meal_details.items()]

            return jsonify({"details": formatted_details}), 200
    except Exception as e:
        print("Error fetching order details:", e)
        return jsonify({"message": "An error occurred while fetching order details"}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000)) 
    app.run(host='0.0.0.0', port=port)