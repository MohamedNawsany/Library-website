import sql from 'mssql';

function isLocalHost(server: string): boolean {
  const s = server.trim().toLowerCase();
  return s === 'localhost' || s === '127.0.0.1' || s === '::1';
}

function assertNotLocalOnVercel(connectionHint: string) {
  const onVercel = Boolean(process.env.VERCEL);
  if (!onVercel) return;
  if (isLocalHost(connectionHint) || /localhost|127\.0\.0\.1/i.test(connectionHint)) {
    throw new Error(
      'Database target is still localhost. On Vercel, set MSSQL_CONNECTION_STRING or MSSQL_SERVER to a cloud SQL host (e.g. Azure SQL: *.database.windows.net). Your PC’s SQL Server is not reachable from Vercel.'
    );
  }
}

/** Prefer `MSSQL_CONNECTION_STRING` on Vercel (paste from Azure portal). */
function getConnectionInput(): string | ReturnType<typeof buildObjectConfig> {
  const connStr = process.env.MSSQL_CONNECTION_STRING?.trim();
  if (connStr) {
    assertNotLocalOnVercel(connStr);
    return connStr;
  }
  return buildObjectConfig();
}

function buildObjectConfig() {
  const server = (process.env.MSSQL_SERVER ?? 'localhost').trim();
  assertNotLocalOnVercel(server);

  const user = process.env.MSSQL_USER ?? 'monaws';
  const password =
    process.env.MSSQL_PASSWORD ??
    (isLocalHost(server) ? '2742004m' : '');
  const database = process.env.MSSQL_DATABASE ?? 'librarydb';

  if (!isLocalHost(server) && !password) {
    throw new Error(
      'MSSQL_PASSWORD is required when MSSQL_SERVER is not localhost (or use MSSQL_CONNECTION_STRING).'
    );
  }

  const encryptEnv = process.env.MSSQL_ENCRYPT;
  const encrypt =
    encryptEnv === 'true' ? true : encryptEnv === 'false' ? false : !isLocalHost(server);

  const trustServerCertificate = process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false';

  const port = process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT, 10) : undefined;
  if (port !== undefined && Number.isNaN(port)) {
    throw new Error('MSSQL_PORT must be a number');
  }

  const onVercel = Boolean(process.env.VERCEL);

  return {
    user,
    password,
    server,
    port,
    database,
    options: {
      encrypt,
      trustServerCertificate,
      enableArithAbort: true,
    },
    pool: {
      max: onVercel ? 5 : 10,
      min: 0,
      idleTimeoutMillis: onVercel ? 10_000 : 30_000,
    },
    connectionTimeout: onVercel ? 25_000 : 30_000,
    requestTimeout: onVercel ? 25_000 : 30_000,
  };
}

type SqlPool = Awaited<ReturnType<typeof sql.connect>>;

let pool: SqlPool | null = null;

async function closeGlobalPool() {
  pool = null;
  try {
    await sql.close();
  } catch {
    /* ignore */
  }
}

export async function connectDB(): Promise<SqlPool> {
  if (pool) return pool;

  const input = getConnectionInput();

  const open = async () => {
    await closeGlobalPool();
    return sql.connect(input);
  };

  try {
    pool = await open();
    return pool;
  } catch {
    await closeGlobalPool();
    try {
      pool = await open();
      return pool;
    } catch (e) {
      await closeGlobalPool();
      throw e;
    }
  }
}

export { sql };
