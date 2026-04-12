# API Testing Guide

This guide shows you how to test all the API endpoints in your library application.

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the test page in your browser:**
   ```
   http://localhost:3000/api-test
   ```

3. **Click the buttons to test each endpoint!**

## Manual Testing with cURL

You can also test endpoints manually using cURL or any HTTP client (Postman, Insomnia, etc.).

### GET Endpoints

#### Get All Books
```bash
curl http://localhost:3000/api/books
```

#### Get Book by ISBN
```bash
curl http://localhost:3000/api/books/9780439708180
```

#### Get All Authors
```bash
curl http://localhost:3000/api/authors
```

#### Get All Categories
```bash
curl http://localhost:3000/api/categories
```

#### Get All Publishers
```bash
curl http://localhost:3000/api/publishers
```

#### Get All Customers
```bash
curl http://localhost:3000/api/customers
```

#### Get Cart Items
```bash
curl "http://localhost:3000/api/cart?customer=1"
```

### POST Endpoints

#### Create Author
```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"AuthorName": "J.R.R. Tolkien"}'
```

#### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "johndoe",
    "UserPassword": "password123",
    "FirstName": "John",
    "LastName": "Doe",
    "Email": "john@example.com",
    "Phone": "555-1234",
    "ShippingAddress": "123 Main St",
    "IsAdmin": 0
  }'
```

#### Create Book
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "ISBN": "9781234567890",
    "Title": "Test Book",
    "PublicationYear": 2024,
    "Price": 29.99,
    "CategoryID": 1,
    "Threshold": 5,
    "QuantityInStock": 10,
    "PublisherID": 1,
    "AuthorIDs": [1, 2]
  }'
```

#### Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1,
    "ISBN": "9780439708180",
    "Quantity": 2
  }'
```

#### Checkout
```bash
curl -X POST http://localhost:3000/api/cart/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1
  }'
```

## Testing with Postman

1. Import these endpoints into Postman:
   - Base URL: `http://localhost:3000`
   - All GET endpoints don't require a body
   - All POST endpoints require JSON body with `Content-Type: application/json` header

## Expected Responses

### Success Response Format
```json
{
  "status": 200,
  "data": [...]
}
```

### Error Response Format
```json
{
  "error": "Error message here"
}
```

## Common Issues

1. **Connection Error**: Make sure SQL Server is running and the connection details in `lib/db.ts` are correct.

2. **404 Not Found**: Ensure the dev server is running on port 3000.

3. **500 Internal Server Error**: Check the server console for detailed error messages.

4. **Database Errors**: Verify that:
   - The database `librarydb` exists
   - All tables are created
   - Sample data is inserted (if needed)

## Testing Checklist

- [ ] GET /api/books - Returns all books with authors
- [ ] GET /api/books/[isbn] - Returns single book with authors
- [ ] GET /api/authors - Returns all authors
- [ ] GET /api/categories - Returns all categories
- [ ] GET /api/publishers - Returns all publishers
- [ ] GET /api/customers - Returns all customers
- [ ] POST /api/authors - Creates new author
- [ ] POST /api/customers - Creates new customer
- [ ] POST /api/books - Creates new book with authors
- [ ] POST /api/cart - Adds item to cart
- [ ] GET /api/cart?customer=X - Gets cart items
- [ ] POST /api/cart/checkout - Completes checkout

