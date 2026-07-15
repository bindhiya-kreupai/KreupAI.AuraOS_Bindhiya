# Project-Scoped Rules

## Prisma and Database Migrations

**CRITICAL RULE:** Due to a past data loss incident, do not execute any Prisma commands (`prisma migrate`, `prisma db push`, etc.) directly against the connected database unless explicitly directed otherwise.

When database schema changes are required, follow this strict process:

1. Modify the Prisma schema (`schema.prisma`) only if genuinely required.
2. Create a separate SQL migration file generated from the updated schema. Do NOT apply it using Prisma.
3. The SQL migration must be executed manually in PG Admin in transaction mode by the user or an authorized database administrator.

**Connection Details for Neon DB in PG Admin:**

- **Host name/address:** `ep-tiny-wind-a14j3imo-pooler.ap-southeast-1.aws.neon.tech`
- **Port:** `5432`
- **Maintenance database:** `neondb`
- **Username:** `neondb_owner`
- **SSL Mode:** `require` (Crucial for Neon DB)
- _The tables will be listed under the `auraos` schema, not `public`._
