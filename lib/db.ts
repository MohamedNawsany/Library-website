import sql from 'mssql';

function isLocalHost(server: string): boolean {
  const s = server.trim().toLowerCase();
  return s === 'localhost' || s === '127.0.0.1' || s === '::1';
}

function buildConfig() {
  const server = process.env.MSSQL_SERVER || 'localhost';
  const user = process.env.MSSQL_USER || 'monaws';
  const password = process.env.MSSQL_PASSWORD || '2742004m';
  const database = process.env.MSSQL_DATABASE || 'librarydb';

  const port = process.env.MSSQL_PORT
    ? parseInt(process.env.MSSQL_PORT, 10)
    : undefined;

  if (port !== undefined && Number.isNaN(port)) {
    throw new Error('MSSQL_PORT must be a valid number');
  }

  return {
    user,
    password,
    server,
    port,
    database,
    options: {
      encrypt: false, // local SQL Server
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  };
}

type SqlPool = Awaited<ReturnType<typeof sql.connect>>;

let pool: SqlPool | null = null;

async function closePool() {
  pool = null;
  try {
    await sql.close();
  } catch {
    // ignore
  }
}

export async function connectDB(): Promise<SqlPool> {
  if (pool) return pool;

  const config = buildConfig();

  try {
    pool = await sql.connect(config);
    return pool;
  } catch (error) {
    await closePool();

    // retry once
    pool = await sql.connect(config);
    return pool;
  }
}

export { sql };