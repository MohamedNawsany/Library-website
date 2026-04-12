import sql from 'mssql';

const config = {
  user: 'monaws',
  password: '2742004m',
  server: 'localhost',
  database: 'librarydb',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

type SqlPool = Awaited<ReturnType<typeof sql.connect>>;

let pool: SqlPool | null = null;

export async function connectDB(): Promise<SqlPool> {
  if (pool) return pool;
  pool = await sql.connect(config);
  console.log('Connected to SQL Server!');
  return pool;
}

export { sql };
