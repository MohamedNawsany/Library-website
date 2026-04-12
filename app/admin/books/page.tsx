'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import AdminGuard from '../../components/AdminGuard';

interface Book {
  ISBN: string;
  Title: string;
  PublicationYear: number;
  Price: number;
  CategoryID: number;
  CategoryName: string;
  Threshold: number;
  QuantityInStock: number;
  PublisherID: number;
  PublisherName: string;
  ImageURL?: string;
  Authors: Array<{ AuthorID: number; AuthorName: string }>;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState({
    isbn: '',
    title: '',
    category: '',
    author: '',
    publisher: ''
  });
  const [formData, setFormData] = useState({
    Title: '',
    PublicationYear: new Date().getFullYear(),
    Price: 0,
    CategoryID: 0,
    Threshold: 0,
    QuantityInStock: 0,
    PublisherID: 0,
  ImageURL: '' // optional
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, categoriesRes, publishersRes, authorsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/categories'),
        fetch('/api/publishers'),
        fetch('/api/authors')
      ]);

      const booksData = await booksRes.json();
      const categoriesData = await categoriesRes.json();
      const publishersData = await publishersRes.json();
      const authorsData = await authorsRes.json();

      if (booksData.success) {
        setBooks(booksData.data);
        setFilteredBooks(booksData.data);
      }
      if (categoriesData.success) setCategories(categoriesData.data);
      if (publishersData.success) setPublishers(publishersData.data);
      if (authorsData.success) setAuthors(authorsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const hasSearch = Object.values(searchQuery).some(v => v.trim() !== '');
    
    if (!hasSearch) {
      setFilteredBooks(books);
      return;
    }

    try {
      const params = new URLSearchParams();
      Object.entries(searchQuery).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`/api/books/search?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setFilteredBooks(result.data || []);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery({ isbn: '', title: '', category: '', author: '', publisher: '' });
    setFilteredBooks(books);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      Title: book.Title,
      PublicationYear: book.PublicationYear,
      Price: parseFloat(book.Price.toString()),
      CategoryID: book.CategoryID,
      Threshold: book.Threshold,
      QuantityInStock: book.QuantityInStock,
      PublisherID: book.PublisherID,
  ImageURL: book.ImageURL || ''
    });
    setSelectedAuthors(book.Authors.map(a => a.AuthorID));
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const res = await fetch('/api/books', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ISBN: editingBook.ISBN,
          ...formData,
          AuthorIDs: selectedAuthors
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Book updated successfully!');
        setShowEditModal(false);
        fetchData();
        handleResetSearch(); // Refresh search results
      } else {
        alert(result.error || 'Failed to update book');
      }
    } catch (error) {
      alert('Error updating book');
    }
  };

  const handleDelete = async (isbn: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const res = await fetch('/api/books', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ISBN: isbn }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Book deleted successfully!');
        fetchData();
        handleResetSearch(); // Refresh search results
      } else {
        alert(result.error || 'Failed to delete book');
      }
    } catch (error) {
      alert('Error deleting book');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <Link
            href="/admin/books/create"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New Book
          </Link>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Books to Edit</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={searchQuery.isbn}
                onChange={(e) => setSearchQuery({ ...searchQuery, isbn: e.target.value })}
                placeholder="Search by ISBN"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={searchQuery.title}
                onChange={(e) => setSearchQuery({ ...searchQuery, title: e.target.value })}
                placeholder="Search by title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={searchQuery.category}
                onChange={(e) => setSearchQuery({ ...searchQuery, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.CategoryID} value={cat.Name}>{cat.Name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={searchQuery.author}
                onChange={(e) => setSearchQuery({ ...searchQuery, author: e.target.value })}
                placeholder="Search by author"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input
                type="text"
                value={searchQuery.publisher}
                onChange={(e) => setSearchQuery({ ...searchQuery, publisher: e.target.value })}
                placeholder="Search by publisher"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetSearch}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Loading books...' : 'No books found. Try adjusting your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                <tr key={book.ISBN} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{book.ISBN}</td>
                  <td className="px-6 py-4 text-sm">{book.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${parseFloat(book.Price.toString()).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      book.QuantityInStock < book.Threshold 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {book.QuantityInStock} (Threshold: {book.Threshold})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{book.CategoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit book details"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.ISBN)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete book"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showEditModal && editingBook && (
          <Modal onClose={() => setShowEditModal(false)}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Book: {editingBook.ISBN}</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Publication Year</label>
                    <input
                      type="number"
                      value={formData.PublicationYear}
                      onChange={(e) => setFormData({ ...formData, PublicationYear: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.Price}
                      onChange={(e) => setFormData({ ...formData, Price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      value={formData.CategoryID}
                      onChange={(e) => setFormData({ ...formData, CategoryID: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.CategoryID} value={cat.CategoryID}>{cat.Name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Publisher *</label>
                    <select
                      required
                      value={formData.PublisherID}
                      onChange={(e) => setFormData({ ...formData, PublisherID: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Publisher</option>
                      {publishers.map(pub => (
                        <option key={pub.PublisherID} value={pub.PublisherID}>{pub.Name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Threshold *</label>
                    <input
                      type="number"
                      required
                      value={formData.Threshold}
                      onChange={(e) => setFormData({ ...formData, Threshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity in Stock *</label>
                    <input
                      type="number"
                      required
                      value={formData.QuantityInStock}
                      onChange={(e) => setFormData({ ...formData, QuantityInStock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
  <label className="block text-sm font-medium mb-1">Image URL</label>
  <input
    type="text"
    value={formData.ImageURL}
    onChange={(e) => setFormData({ ...formData, ImageURL: e.target.value })}
    placeholder="https://example.com/book-cover.jpg"
    className="w-full px-3 py-2 border rounded-md"
  />
</div>
                <div>
                  <label className="block text-sm font-medium mb-1">Authors</label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {authors.map(author => (
                      <label key={author.AuthorID} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedAuthors.includes(author.AuthorID)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAuthors([...selectedAuthors, author.AuthorID]);
                            } else {
                              setSelectedAuthors(selectedAuthors.filter(id => id !== author.AuthorID));
                            }
                          }}
                        />
                        <span>{author.AuthorName}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}
