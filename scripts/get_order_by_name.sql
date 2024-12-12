SELECT orders.id, meal_id, customer_name, order_date, employee_id, total_price, meals.meal_type, item_name 
FROM orders
LEFT JOIN meals ON orders.id = meals.order_id
LEFT JOIN meal_item ON meal_item.meal_id = meals.id
WHERE orders.customer_name = ?
ORDER BY meal_id;