// MongoDB init — creates indexes and seed data
db = db.getSiblingDB('ecommerce');
db.createCollection('products');
db.createCollection('users');
db.createCollection('orders');
print('✅ MongoDB collections created');
