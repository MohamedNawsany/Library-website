import sql from 'mssql';

function isLocalHost(server: string): boolean {
  const s = server.trim().toLowerCase();
  return s === 'localhost' || s === '127.0.0.1' || s === '::1';
}

function getSqlConfig() {
  const server = (process.env.MSSQL_SERVER ?? 'localhost').trim();
  const onVercel = Boolean(process.env.VERCEL);

  if (onVercel && (!server || isLocalHost(server))) {
    throw new Error(
      'Set MSSQL_SERVER (and MSSQL_USER, MSSQL_PASSWORD, MSSQL_DATABASE) in the Vercel project environment. Your laptop’s SQL Server at localhost is not reachable from Vercel; use Azure SQL Database or another internet-facing SQL Server.'
    );
  }

  const user = process.env.MSSQL_USER ?? 'monaws';
  const password =
    process.env.MSSQL_PASSWORD ??
    (isLocalHost(server) ? '2742004m' : '');
  const database = process.env.MSSQL_DATABASE ?? 'librarydb';

  const encryptEnv = process.env.MSSQL_ENCRYPT;
  const encrypt =
    encryptEnv === 'true' ? true : encryptEnv === 'false' ? false : !isLocalHost(server);

  const trustServerCertificate = process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false';

  const port = process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT, 10) : undefined;
  if (port !== undefined && Number.isNaN(port)) {
    throw new Error('MSSQL_PORT must be a number');
  }

  return {
    user,
    password,
    server,
    port,
    database,
    options: {
      encrypt,
      trustServerCertificate,
    },
    pool: {
      max: onVercel ? 5 : 10,
      min: 0,
      idleTimeoutMillis: onVercel ? 10_000 : 30_000,
    },
    connectionTimeout: onVercel ? 20_000 : 30_000,
    requestTimeout: onVercel ? 25_000 : 30_000,
  };
}

type SqlPool = Awaited<ReturnType<typeof sql.connect>>;

let pool: SqlPool | null = null;

export async function connectDB(): Promise<SqlPool> {
  if (pool) return pool;
  pool = await sql.connect(getSqlConfig());
  return pool;
}

export { sql };
