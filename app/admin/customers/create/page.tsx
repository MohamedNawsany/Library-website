'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminGuard from '../../../components/AdminGuard';

export default function CreateCustomerPage() {
  const [formData, setFormData] = useState({
    Username: '',
    UserPassword: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    ShippingAddress: '',
    IsAdmin: false
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Username || !formData.UserPassword || !formData.FirstName || 
        !formData.LastName || !formData.Email || !formData.ShippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          IsAdmin: formData.IsAdmin ? 1 : 0
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Customer created successfully!');
        router.push('/admin/customers');
      } else {
        alert(result.error || 'Failed to create customer');
      }
    } catch (error) {
      alert('Error creating customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/customers')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Customers
          </button>
          <h1 className="text-3xl font-bold">Add New Customer</h1>
        </div>

        <div className="max-w-2xl rounded-lg bg-white p-6 shadow-md sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Username}
                  onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.UserPassword}
                  onChange={(e) => setFormData({ ...formData, UserPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.FirstName}
                  onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.LastName}
                  onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address *
              </label>
              <textarea
                required
                rows={3}
                value={formData.ShippingAddress}
                onChange={(e) => setFormData({ ...formData, ShippingAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.IsAdmin}
                  onChange={(e) => setFormData({ ...formData, IsAdmin: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? 'Creating...' : 'Create Customer'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/customers')}
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

