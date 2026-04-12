'use client';

import React from 'react';
import Link from 'next/link';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4">Oops!</h2>
        <p className="text-gray-700 mb-6">You must log in first to add products to your cart.</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log in now
        </Link>
      </div>
    </div>
  );
}
