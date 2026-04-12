// Helper function to get the base URL for API calls
export function getApiUrl(): string {
  // In production, you should set NEXT_PUBLIC_BASE_URL environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // For server-side rendering, default to localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  
  // For client-side, use relative URL
  return '';
}

