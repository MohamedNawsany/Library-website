'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminGuard from '../../../components/AdminGuard';

export default function CreateBookPage() {
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
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, publishersRes, authorsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/publishers'),
        fetch('/api/authors')
      ]);

      const categoriesData = await categoriesRes.json();
      const publishersData = await publishersRes.json();
      const authorsData = await authorsRes.json();

      if (categoriesData.success) setCategories(categoriesData.data);
      if (publishersData.success) setPublishers(publishersData.data);
      if (authorsData.success) setAuthors(authorsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Title || !formData.CategoryID || !formData.PublisherID) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedAuthors.length === 0) {
      alert('Please select at least one author');
      return;
    }

    setSaving(true);
    try {
      // Generate ISBN automatically (e.g., 978 + random 10-digit number)
      const generatedISBN = `978${Math.floor(Math.random() * 1_000_000_0000)
        .toString()
        .padStart(10, '0')}`;

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ISBN: generatedISBN,
          ...formData,
          AuthorIDs: selectedAuthors
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Book created successfully! ISBN: ${generatedISBN}`);
        router.push('/admin/books');
      } else {
        alert(result.error || 'Failed to create book');
      }
    } catch (error) {
      alert('Error creating book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p>Loading...</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/books')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Books
          </button>
          <h1 className="text-3xl font-bold">Add New Book</h1>
        </div>

        <div className="max-w-4xl rounded-lg bg-white p-6 shadow-md sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.Title}
                onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Book title"
              />
            </div>

            {/* Publication Year & Price */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Year
                </label>
                <input
                  type="number"
                  value={formData.PublicationYear}
                  onChange={(e) => setFormData({ ...formData, PublicationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Image URL
  </label>
  <input
    type="text"
    value={formData.ImageURL || ""}
    onChange={(e) => setFormData({ ...formData, ImageURL: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="https://example.com/book-cover.jpg"
  />
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.Price}
                  onChange={(e) => setFormData({ ...formData, Price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & Publisher */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.CategoryID}
                  onChange={(e) => setFormData({ ...formData, CategoryID: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.Name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publisher *
                </label>
                <select
                  required
                  value={formData.PublisherID}
                  onChange={(e) => setFormData({ ...formData, PublisherID: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Publisher</option>
                  {publishers.map(pub => (
                    <option key={pub.PublisherID} value={pub.PublisherID}>{pub.Name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Threshold & Quantity */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threshold *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.Threshold}
                  onChange={(e) => setFormData({ ...formData, Threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity in Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.QuantityInStock}
                  onChange={(e) => setFormData({ ...formData, QuantityInStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Authors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authors * (Select at least one)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4 bg-gray-50">
                {authors.length === 0 ? (
                  <p className="text-gray-500 text-sm">No authors available. Please add authors first.</p>
                ) : (
                  <div className="space-y-2">
                    {authors.map(author => (
                      <label key={author.AuthorID} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded">
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
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{author.AuthorName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedAuthors.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedAuthors.length} author(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? 'Creating...' : 'Create Book'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/books')}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
