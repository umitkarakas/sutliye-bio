const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL must be configured.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const before = await client.query('SELECT id, name, blurb FROM "Branch" WHERE blurb IS NOT NULL');
    console.log(`${before.rows.length} şubede blurb bulundu:`);
    for (const row of before.rows) {
      console.log(`  [${row.name}] → "${row.blurb}"`);
    }

    if (before.rows.length === 0) {
      console.log("Temizlenecek blurb yok.");
      return;
    }

    const result = await client.query(
      'UPDATE "Branch" SET blurb = NULL, "updatedAt" = NOW() WHERE blurb IS NOT NULL'
    );
    console.log(`\n${result.rowCount} şubenin blurb alanı temizlendi.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
