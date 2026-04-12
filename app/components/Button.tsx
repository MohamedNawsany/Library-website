'use client';
export default function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      {children}
    </button>
  );
}
