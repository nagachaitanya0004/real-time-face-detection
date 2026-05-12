export const users = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'active', joinDate: '2023-10-15', avatar: 'AS', orders: 12, revenue: '$1,240' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Editor', status: 'active', joinDate: '2023-11-02', avatar: 'BJ', orders: 8, revenue: '$850' },
  { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Viewer', status: 'inactive', joinDate: '2023-12-11', avatar: 'CD', orders: 3, revenue: '$120' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Manager', status: 'active', joinDate: '2024-01-05', avatar: 'DP', orders: 45, revenue: '$4,500' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Editor', status: 'suspended', joinDate: '2024-01-20', avatar: 'EH', orders: 0, revenue: '$0' },
];

for(let i=6; i<=20; i++) {
  users.push({ 
    id: i, 
    name: `User ${i}`, 
    email: `user${i}@example.com`, 
    role: 'Viewer', 
    status: 'active', 
    joinDate: '2024-02-10', 
    avatar: `U${i}`, 
    orders: Math.floor(Math.random()*20), 
    revenue: `$${Math.floor(Math.random()*1000)}` 
  });
}

export const orders = [
  { id: 1, orderId: 'ORD-001', customer: 'Alice Smith', product: 'MacBook Pro 16"', amount: '$2,499', status: 'completed', date: '2024-03-01', items: 1 },
  { id: 2, orderId: 'ORD-002', customer: 'Diana Prince', product: 'iPhone 15 Pro', amount: '$999', status: 'processing', date: '2024-03-02', items: 1 },
  { id: 3, orderId: 'ORD-003', customer: 'Bob Jones', product: 'AirPods Max', amount: '$549', status: 'pending', date: '2024-03-03', items: 2 },
  { id: 4, orderId: 'ORD-004', customer: 'Charlie Davis', product: 'iPad Air', amount: '$599', status: 'cancelled', date: '2024-03-04', items: 1 },
  { id: 5, orderId: 'ORD-005', customer: 'Ethan Hunt', product: 'Apple Watch Ultra', amount: '$799', status: 'completed', date: '2024-03-05', items: 1 },
];

for(let i=6; i<=20; i++) {
  orders.push({ 
    id: i, 
    orderId: `ORD-00${i}`, 
    customer: `User ${i}`, 
    product: 'Accessories Bundle', 
    amount: `$${Math.floor(Math.random()*300 + 50)}`, 
    status: ['completed', 'pending', 'processing', 'cancelled'][Math.floor(Math.random()*4)], 
    date: `2024-03-${String(i).padStart(2,'0')}`, 
    items: Math.floor(Math.random()*5)+1 
  });
}

export const products = [
  { id: 1, name: 'MacBook Pro 16"', category: 'Electronics', price: '$2,499', stock: 45, status: 'In Stock', sales: 120, rating: 4.9 },
  { id: 2, name: 'iPhone 15 Pro', category: 'Electronics', price: '$999', stock: 12, status: 'Low Stock', sales: 450, rating: 4.8 },
  { id: 3, name: 'AirPods Max', category: 'Electronics', price: '$549', stock: 0, status: 'Out of Stock', sales: 300, rating: 4.6 },
  { id: 4, name: 'Graphic T-Shirt', category: 'Clothing', price: '$29', stock: 200, status: 'In Stock', sales: 850, rating: 4.2 },
  { id: 5, name: 'Design Patterns Book', category: 'Books', price: '$49', stock: 80, status: 'In Stock', sales: 150, rating: 4.9 },
];

for(let i=6; i<=20; i++) {
  products.push({ 
    id: i, 
    name: `Product ${i}`, 
    category: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'][Math.floor(Math.random()*5)], 
    price: `$${Math.floor(Math.random()*100 + 10)}`, 
    stock: Math.floor(Math.random()*100), 
    status: 'In Stock', 
    sales: Math.floor(Math.random()*500), 
    rating: (Math.random()*2 + 3).toFixed(1) 
  });
}
