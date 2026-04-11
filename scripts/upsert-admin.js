const { randomBytes, scryptSync } = require("node:crypto");
const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME || "Demo Owner";

  if (!databaseUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL must be configured.");
  }

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    const businessResult = await client.query('SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1');
    const businessId = businessResult.rows[0]?.id;

    if (!businessId) {
      throw new Error("No business found. Seed the business first.");
    }

    await client.query(
      `
        INSERT INTO "AdminUser" (
          id,
          "businessId",
          email,
          "passwordHash",
          "fullName",
          role,
          "isActive",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          md5(random()::text || clock_timestamp()::text),
          $1,
          $2,
          $3,
          $4,
          'owner',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (email)
        DO UPDATE SET
          "businessId" = EXCLUDED."businessId",
          "passwordHash" = EXCLUDED."passwordHash",
          "fullName" = EXCLUDED."fullName",
          role = 'owner',
          "isActive" = true,
          "updatedAt" = NOW()
      `,
      [businessId, email, passwordHash, fullName]
    );

    console.log(`Admin user upserted for ${email}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
