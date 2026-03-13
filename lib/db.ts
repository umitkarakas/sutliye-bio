import { Pool, type PoolClient, type QueryResultRow } from "@neondatabase/serverless";

export type DbQueryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

function createPool() {
  return new Pool({
    connectionString: getDatabaseUrl()
  });
}

export async function withDb<T>(run: (client: Pool) => Promise<T>) {
  const pool = createPool();

  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>) {
  return withDb(async (pool) => {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");
      const result = await run(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
}

export async function queryFirst<T extends QueryResultRow>(
  queryable: DbQueryable,
  text: string,
  values: unknown[] = []
) {
  const result = await queryable.query<T>(text, values);
  return result.rows[0];
}
