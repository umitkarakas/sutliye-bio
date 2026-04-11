import { Client } from "pg";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  throw new Error("SOURCE_DATABASE_URL and TARGET_DATABASE_URL must be set.");
}

const tables = [
  "Business",
  "AdminUser",
  "MenuCategory",
  "Product",
  "Branch",
  "BranchHour",
  "BranchProduct",
  "Feedback",
  "EventLog"
];

function quoteIdentifier(value) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

async function loadColumns(client, table) {
  const result = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table]
  );

  return result.rows.map((row) => row.column_name);
}

async function copyTable(source, target, table) {
  const columns = await loadColumns(source, table);
  const selectSql = `SELECT ${columns.map(quoteIdentifier).join(", ")} FROM ${quoteIdentifier(table)}`;
  const rows = (await source.query(selectSql)).rows;

  if (rows.length === 0) {
    console.log(`${table}: 0 rows`);
    return;
  }

  const batchSize = 250;

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const values = [];
    const placeholders = batch.map((row, rowIndex) => {
      const rowPlaceholders = columns.map((column, columnIndex) => {
        values.push(row[column]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });

      return `(${rowPlaceholders.join(", ")})`;
    });

    const insertSql = `
      INSERT INTO ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(", ")})
      VALUES ${placeholders.join(", ")}
    `;

    await target.query(insertSql, values);
  }

  console.log(`${table}: ${rows.length} rows`);
}

const source = new Client({ connectionString: sourceUrl });
const target = new Client({ connectionString: targetUrl });

try {
  await source.connect();
  await target.connect();

  await target.query("BEGIN");
  await target.query(
    'TRUNCATE TABLE "EventLog", "Feedback", "BranchProduct", "BranchHour", "Product", "MenuCategory", "AdminUser", "Branch", "Business" RESTART IDENTITY CASCADE'
  );

  for (const table of tables) {
    await copyTable(source, target, table);
  }

  await target.query("COMMIT");
  console.log("Migration complete.");
} catch (error) {
  await target.query("ROLLBACK").catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
} finally {
  await Promise.allSettled([source.end(), target.end()]);
}
