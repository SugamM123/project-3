import psycopg2
import random
import string
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os


load_dotenv()

DB_PARAMS = {
    "dbname": os.getenv("DATABASE_NAME"),
    "user": os.getenv("USER"),
    "password": os.getenv("PASSWORD"),
    "host": os.getenv("HOST"),
    "port": os.getenv("PG_PORT")
}

def create_dummy_table(cursor, original_table, dummy_table):
    cursor.execute(f"CREATE TABLE {dummy_table} (LIKE {original_table} INCLUDING ALL);")

def random_value(data_type):
    if "integer" in data_type:
        return random.randint(1, 1000)
    elif "text" in data_type:
        return ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    elif "timestamp" in data_type:
        return datetime.now() - timedelta(days=random.randint(0, 365))
    elif "boolean" in data_type:
        return random.choice([True, False])
    elif "numeric" in data_type:
        return round(random.uniform(1, 99.99), 2)
    elif "character varying" in data_type:
        length = 5
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    else:
        return None 

def get_column_info(cursor, table):
    cursor.execute(f"""
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = '{table}';
    """)
    return cursor.fetchall()

def populate_dummy_table(cursor, dummy_table, columns, n):
    for _ in range(n):
        values = [
            random_value(data_type)
            for _, data_type, max_length in columns
        ]
        placeholders = ', '.join(['%s'] * len(values))
        column_names = ', '.join([col for col, _, _ in columns])
        cursor.execute(f"INSERT INTO {dummy_table} ({column_names}) VALUES ({placeholders})", values)

def main():
    original_table = "prices"
    dummy_table = "prices_clone"
    num_records = 10

    with psycopg2.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cursor:
            create_dummy_table(cursor, original_table, dummy_table)

            columns = get_column_info(cursor, original_table)

            populate_dummy_table(cursor, dummy_table, columns, num_records)

            conn.commit()
    print("Dummy table populated with random data.")

if __name__ == "__main__":
    main()
