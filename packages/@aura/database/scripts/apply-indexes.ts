/**
 * Apply Performance Indexes Script
 * Applies database indexes for improved query performance
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyIndexes() {
  console.log('🚀 Starting database index creation...\n');

  const startTime = Date.now();

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../prisma/migrations/add_performance_indexes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split into individual statements (filter out comments and empty lines)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));

    console.log(`📝 Found ${statements.length} index creation statements\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: { statement: string; error: string }[] = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Extract index name from statement
      const indexNameMatch = statement.match(/idx_\w+/);
      const indexName = indexNameMatch ? indexNameMatch[0] : `statement ${i + 1}`;

      try {
        process.stdout.write(`[${i + 1}/${statements.length}] Creating ${indexName}... `);

        await prisma.$executeRawUnsafe(statement + ';');

        console.log('✅');
        successCount++;
      } catch (error: any) {
        // Check if error is "index already exists"
        if (error.message?.includes('already exists')) {
          console.log('⏭️  (already exists)');
          successCount++;
        } else {
          console.log('❌');
          errorCount++;
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: error.message,
          });
        }
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Index Creation Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:\n');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. Statement: ${err.statement}`);
        console.log(`   Error: ${err.error}\n`);
      });
    }

    if (errorCount === 0) {
      console.log('\n🎉 All indexes created successfully!');
      console.log('\n💡 Recommended: Run ANALYZE to update query planner statistics');
      console.log('   Execute: ANALYZE;');
    }

    // Get index statistics
    console.log('\n📈 Fetching index statistics...\n');

    const indexStats = await prisma.$queryRaw<
      Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        indexdef: string;
      }>
    >`
      SELECT schemaname, tablename, indexname,
             pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
      LIMIT 10
    `;

    console.log('Sample of created indexes:');
    console.table(
      indexStats.map((stat) => ({
        Table: stat.tablename,
        Index: stat.indexname,
      }))
    );

    // Total index count
    const totalIndexCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
    `;

    console.log(`\n📊 Total custom indexes: ${totalIndexCount[0].count}\n`);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
applyIndexes()
  .then(() => {
    console.log('\n✅ Index application complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
