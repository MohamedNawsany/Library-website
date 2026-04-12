'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AdminGuard from '../../components/AdminGuard';

interface Customer {
  CustomerID: number;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  ShippingAddress: string;
  IsAdmin: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CustomerID: customerId }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Customer deleted successfully!');
        fetchCustomers();
      } else {
        alert(result.error || 'Failed to delete customer');
      }
    } catch (error) {
      alert('Error deleting customer');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Manage Customers</h1>
          <Link
            href="/admin/customers/create"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New Customer
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.CustomerID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{customer.CustomerID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.Username}</td>
                    <td className="px-6 py-4 text-sm">{customer.FirstName} {customer.LastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.Email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.Phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        customer.IsAdmin 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.IsAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(customer.CustomerID)}
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
      </div>
    </AdminGuard>
  );
}

