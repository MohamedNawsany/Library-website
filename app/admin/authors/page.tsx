'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminGuard from '../../components/AdminGuard';
import Modal from '../../components/Modal';

interface Author {
  AuthorID: number;
  AuthorName: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/authors');
      const result = await res.json();
      if (result.success) {
        setAuthors(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAuthor(null);
    setAuthorName('');
    setShowModal(true);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setAuthorName(author.AuthorName);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      alert('Author name is required');
      return;
    }

    try {
      const url = '/api/authors';
      const method = editingAuthor ? 'PATCH' : 'POST';
      const body = editingAuthor
        ? { AuthorID: editingAuthor.AuthorID, AuthorName: authorName }
        : { AuthorName: authorName };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        alert(editingAuthor ? 'Author updated successfully!' : 'Author created successfully!');
        setShowModal(false);
        fetchAuthors();
      } else {
        alert(result.error || 'Failed to save author');
      }
    } catch (error) {
      alert('Error saving author');
    }
  };

  const handleDelete = async (authorId: number) => {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      const res = await fetch('/api/authors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AuthorID: authorId }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Author deleted successfully!');
        fetchAuthors();
      } else {
        alert(result.error || 'Failed to delete author');
      }
    } catch (error) {
      alert('Error deleting author');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Manage Authors</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New Author
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {authors.map((author) => (
                  <tr key={author.AuthorID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{author.AuthorID}</td>
                    <td className="px-6 py-4 text-sm">{author.AuthorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(author.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(author)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(author.AuthorID)}
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
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter author name"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingAuthor ? 'Update' : 'Create'} Author
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

