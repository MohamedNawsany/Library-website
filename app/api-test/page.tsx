'use client';

import { useState } from 'react';

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [name]: { status: response.status, ok: response.ok, data, error: null }
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [name]: { status: 0, ok: false, data: null, error: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  // GET
  const testBooks = () => testEndpoint('books', '/api/books');
  const testBookByISBN = () => testEndpoint('bookByISBN', '/api/books/9780439708180');
  const testAuthors = () => testEndpoint('authors', '/api/authors');
  const testCategories = () => testEndpoint('categories', '/api/categories');
  const testPublishers = () => testEndpoint('publishers', '/api/publishers');
  const testCustomers = () => testEndpoint('customers', '/api/customers');
  const testGetCart = () => testEndpoint('getCart', '/api/cart?customer=1');

  // CREATE (POST)
  const testCreateAuthor = () => testEndpoint('createAuthor', '/api/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ AuthorName: 'Test Author ' + Date.now() })
  });

  const testCreateCustomer = () => testEndpoint('createCustomer', '/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Username: 'testuser' + Date.now(),
      UserPassword: 'password123',
      FirstName: 'Test',
      LastName: 'User',
      Email: 'test' + Date.now() + '@example.com',
      Phone: '555-1234',
      ShippingAddress: '123 Test St',
      IsAdmin: 0
    })
  });

  const testCreateBook = () => testEndpoint('createBook', '/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ISBN: 'TEST' + Date.now(),
      Title: 'Test Book',
      PublicationYear: 2024,
      Price: 19.99,
      CategoryID: 1,
      Threshold: 5,
      QuantityInStock: 10,
      PublisherID: 1,
      AuthorIDs: [1]
    })
  });

  const testAddToCart = () => testEndpoint('addToCart', '/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CustomerID: 1, ISBN: '9780439708180', Quantity: 1 })
  });

  const testCheckout = () => testEndpoint('checkout', '/api/cart/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CustomerID: 1 })
  });

  // UPDATE (PATCH)
  const testUpdateAuthor = () => testEndpoint('updateAuthor', '/api/authors', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ AuthorID: 1, AuthorName: 'Updated Author ' + Date.now() })
  });

  const testUpdateCustomer = () => testEndpoint('updateCustomer', '/api/customers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CustomerID: 1, FirstName: 'UpdatedName' })
  });

  const testUpdateBook = () => testEndpoint('updateBook', '/api/books', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ISBN: '9780439708180', Title: 'Updated Title' })
  });

  const testUpdateCategory = () => testEndpoint('updateCategory', '/api/categories', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CategoryID: 1, Name: 'Updated Category' })
  });

  const testUpdatePublisher = () => testEndpoint('updatePublisher', '/api/publishers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PublisherID: 1, Name: 'Updated Publisher' })
  });

  // DELETE
  const testDeleteAuthor = () => testEndpoint('deleteAuthor', '/api/authors', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ AuthorID: 1 })
  });

  const testDeleteCustomer = () => testEndpoint('deleteCustomer', '/api/customers', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CustomerID: 1 })
  });

  const testDeleteBook = () => testEndpoint('deleteBook', '/api/books', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ISBN: '9780439708180' })
  });

  const testDeleteCategory = () => testEndpoint('deleteCategory', '/api/categories', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CategoryID: 1 })
  });

  const testDeletePublisher = () => testEndpoint('deletePublisher', '/api/publishers', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PublisherID: 1 })
  });

  const TestButton = ({ name, onClick, label }: { name: string; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      disabled={loading[name]}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
    >
      {loading[name] ? 'Testing...' : label}
    </button>
  );

  const ResultDisplay = ({ name, label }: { name: string; label: string }) => {
    const result = results[name];
    if (!result) return null;
    return (
      <div className={`p-4 rounded-lg border ${result.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="font-semibold mb-2">{label}</h3>
        <p className="text-sm mb-2">Status: <span className={result.ok ? 'text-green-700' : 'text-red-700'}>{result.status}</span></p>
        {result.error ? (
          <pre className="text-xs bg-white p-2 rounded overflow-x-auto text-red-600">{result.error}</pre>
        ) : (
          <pre className="text-xs bg-white p-2 rounded overflow-x-auto max-h-60 overflow-y-auto">{JSON.stringify(result.data, null, 2)}</pre>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">API Endpoints Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">GET Endpoints</h2>
            <div className="flex flex-wrap gap-4">
              <TestButton name="books" onClick={testBooks} label="Get All Books" />
              <TestButton name="bookByISBN" onClick={testBookByISBN} label="Get Book by ISBN" />
              <TestButton name="authors" onClick={testAuthors} label="Get All Authors" />
              <TestButton name="categories" onClick={testCategories} label="Get All Categories" />
              <TestButton name="publishers" onClick={testPublishers} label="Get All Publishers" />
              <TestButton name="customers" onClick={testCustomers} label="Get All Customers" />
              <TestButton name="getCart" onClick={testGetCart} label="Get Cart (Customer 1)" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">POST Endpoints</h2>
            <div className="flex flex-wrap gap-4">
              <TestButton name="createAuthor" onClick={testCreateAuthor} label="Create Author" />
              <TestButton name="createCustomer" onClick={testCreateCustomer} label="Create Customer" />
              <TestButton name="createBook" onClick={testCreateBook} label="Create Book" />
              <TestButton name="addToCart" onClick={testAddToCart} label="Add to Cart" />
              <TestButton name="checkout" onClick={testCheckout} label="Checkout" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">PATCH Endpoints</h2>
            <div className="flex flex-wrap gap-4">
              <TestButton name="updateAuthor" onClick={testUpdateAuthor} label="Update Author" />
              <TestButton name="updateCustomer" onClick={testUpdateCustomer} label="Update Customer" />
              <TestButton name="updateBook" onClick={testUpdateBook} label="Update Book" />
              <TestButton name="updateCategory" onClick={testUpdateCategory} label="Update Category" />
              <TestButton name="updatePublisher" onClick={testUpdatePublisher} label="Update Publisher" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">DELETE Endpoints</h2>
            <div className="flex flex-wrap gap-4">
              <TestButton name="deleteAuthor" onClick={testDeleteAuthor} label="Delete Author" />
              <TestButton name="deleteCustomer" onClick={testDeleteCustomer} label="Delete Customer" />
              <TestButton name="deleteBook" onClick={testDeleteBook} label="Delete Book" />
              <TestButton name="deleteCategory" onClick={testDeleteCategory} label="Delete Category" />
              <TestButton name="deletePublisher" onClick={testDeletePublisher} label="Delete Publisher" />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">Results</h2>
          {Object.keys(results).map(key => (
            <ResultDisplay key={key} name={key} label={key} />
          ))}
        </div>
      </div>
    </div>
  );
}

