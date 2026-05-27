CREATE TABLE customer (
    customer_id VARCHAR(10) PRIMARY KEY,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6)
);
CREATE TABLE stores (
    store_id VARCHAR(10) PRIMARY KEY,
    zipcode VARCHAR(10),
    state_abbr CHAR(2),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    city VARCHAR(50),
    state VARCHAR(50),
    distance FLOAT
);
CREATE TABLE products (
    sku VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    category VARCHAR(100),
    size VARCHAR(50),
    ingredients TEXT,
    launch DATE
);
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id VARCHAR(10),
    store_id VARCHAR(10),
    order_date TIMESTAMP,
    n_items INTEGER,
    total DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);
CREATE TABLE order_items (
    order_id INTEGER,
    sku VARCHAR(10),
    PRIMARY KEY (order_id, sku),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sku) REFERENCES products(sku)
);