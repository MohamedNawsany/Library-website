'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminGuard from '../../components/AdminGuard';
import Modal from '../../components/Modal';

interface Publisher {
  PublisherID: number;
  Name: string;
  Address: string;
  Phone: string;
}

export default function AdminPublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    Phone: ''
  });
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const res = await fetch('/api/publishers');
      const result = await res.json();
      if (result.success) {
        setPublishers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching publishers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPublisher(null);
    setFormData({ Name: '', Address: '', Phone: '' });
    setShowModal(true);
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setFormData({
      Name: publisher.Name,
      Address: publisher.Address || '',
      Phone: publisher.Phone || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Name.trim()) {
      alert('Publisher name is required');
      return;
    }

    try {
      const url = '/api/publishers';
      const method = editingPublisher ? 'PATCH' : 'POST';
      const body = editingPublisher
        ? { PublisherID: editingPublisher.PublisherID, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        alert(editingPublisher ? 'Publisher updated successfully!' : 'Publisher created successfully!');
        setShowModal(false);
        fetchPublishers();
      } else {
        alert(result.error || 'Failed to save publisher');
      }
    } catch (error) {
      alert('Error saving publisher');
    }
  };

  const handleDelete = async (publisherId: number) => {
    if (!confirm('Are you sure you want to delete this publisher?')) return;

    try {
      const res = await fetch('/api/publishers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PublisherID: publisherId }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Publisher deleted successfully!');
        fetchPublishers();
      } else {
        alert(result.error || 'Failed to delete publisher');
      }
    } catch (error) {
      alert('Error deleting publisher');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Manage Publishers</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New Publisher
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publishers.map((publisher) => (
                  <tr key={publisher.PublisherID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{publisher.PublisherID}</td>
                    <td className="px-6 py-4 text-sm font-medium">{publisher.Name}</td>
                    <td className="px-6 py-4 text-sm">{publisher.Address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{publisher.Phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(publisher)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(publisher.PublisherID)}
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
                {editingPublisher ? 'Edit Publisher' : 'Add New Publisher'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Publisher name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.Address}
                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Publisher address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.Phone}
                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Phone number"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingPublisher ? 'Update' : 'Create'} Publisher
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

