'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminGuard from '../../components/AdminGuard';
import Modal from '../../components/Modal';

interface Category {
  CategoryID: number;
  Name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const result = await res.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.Name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const url = '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const body = editingCategory
        ? { CategoryID: editingCategory.CategoryID, Name: categoryName }
        : { Name: categoryName };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setShowModal(false);
        fetchCategories();
      } else {
        alert(result.error || 'Failed to save category');
      }
    } catch (error) {
      alert('Error saving category');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This may affect books using this category.')) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CategoryID: categoryId }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Error deleting category');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Manage Categories</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New Category
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.CategoryID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{category.CategoryID}</td>
                    <td className="px-6 py-4 text-sm font-medium">{category.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.CategoryID)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Science, Art, Religion, History, Geography"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valid categories: Science, Art, Religion, History, Geography
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCategory ? 'Update' : 'Create'} Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </AdminGuard>
  );
}

