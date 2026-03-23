import sql from "mssql";

// Named instance 지원: "HOST\\INSTANCE" → server=HOST, instanceName=INSTANCE
const rawServer = process.env.MSSQL_SERVER ?? "localhost";
const parts = rawServer.split("\\");
const serverHost = parts[0] || "localhost";
const instanceName = parts[1] || undefined;

const config: sql.config = {
  server: serverHost,
  ...(instanceName ? {} : { port: parseInt(process.env.MSSQL_PORT ?? "1433") }),
  database: process.env.MSSQL_DATABASE!,
  user: process.env.MSSQL_USER!,
  password: process.env.MSSQL_PASSWORD!,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: process.env.MSSQL_TRUST_CERT !== "false",
    ...(instanceName ? { instanceName } : {}),
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

export { sql };
