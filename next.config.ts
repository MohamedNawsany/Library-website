/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevents Next from bundling these; bundled mssql/tedious often breaks on Vercel.
  serverExternalPackages: ['mssql', 'tedious', 'tarn', '@tediousjs/connection-string'],
};

module.exports = nextConfig;
