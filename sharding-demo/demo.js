import ShardManager, { shardConfigs } from './shard-manager.js';

/**
 * Sharding Demo - Learn how data gets distributed across shards
 */
async function main() {
  console.log('='.repeat(60));
  console.log('SHARDING DEMO - Learning Database Sharding with PostgreSQL');
  console.log('='.repeat(60));
  console.log('\n');

  const shardManager = new ShardManager(shardConfigs);

  try {
    // Wait for connections to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ========================================
    // STEP 1: Insert users across shards
    // ========================================
    console.log('📝 STEP 1: Inserting users (watch which shard each goes to)\n');

    const users = [
      { id: 1, username: 'alice', email: 'alice@example.com' },
      { id: 2, username: 'bob', email: 'bob@example.com' },
      { id: 3, username: 'charlie', email: 'charlie@example.com' },
      { id: 4, username: 'diana', email: 'diana@example.com' },
      { id: 5, username: 'eve', email: 'eve@example.com' },
      { id: 6, username: 'frank', email: 'frank@example.com' },
      { id: 100, username: 'user100', email: 'user100@example.com' },
      { id: 101, username: 'user101', email: 'user101@example.com' },
      { id: 102, username: 'user102', email: 'user102@example.com' },
    ];

    for (const user of users) {
      // The user ID is our shard key - it determines which shard stores this user
      await shardManager.query(
        user.id,
        'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [user.id, user.username, user.email]
      );
      console.log(`  ✓ User "${user.username}" (ID: ${user.id}) inserted`);
    }

    console.log('\n');

    // ========================================
    // STEP 2: Insert orders (same shard as user)
    // ========================================
    console.log('📦 STEP 2: Inserting orders (co-located with their user)\n');

    const orders = [
      { id: 1001, userId: 1, product: 'Laptop', amount: 999.99 },
      { id: 1002, userId: 1, product: 'Mouse', amount: 29.99 },
      { id: 1003, userId: 2, product: 'Keyboard', amount: 79.99 },
      { id: 1004, userId: 3, product: 'Monitor', amount: 299.99 },
      { id: 1005, userId: 4, product: 'Headphones', amount: 149.99 },
      { id: 1006, userId: 5, product: 'Webcam', amount: 89.99 },
    ];

    for (const order of orders) {
      // IMPORTANT: We shard by user_id, NOT order_id
      // This keeps all of a user's orders on the same shard as the user
      await shardManager.query(
        order.userId, // Shard key is the user ID!
        'INSERT INTO orders (id, user_id, product_name, amount) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [order.id, order.userId, order.product, order.amount]
      );
      console.log(`  ✓ Order #${order.id} for user ${order.userId} inserted`);
    }

    console.log('\n');

    // ========================================
    // STEP 3: Query a specific user (single shard)
    // ========================================
    console.log('🔍 STEP 3: Query single user with their orders (efficient - single shard)\n');

    const userId = 1;
    const userResult = await shardManager.query(
      userId,
      `SELECT u.*, o.id as order_id, o.product_name, o.amount
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.id = $1`,
      [userId]
    );

    console.log(`  User ${userId} and their orders:`);
    userResult.rows.forEach(row => {
      console.log(`    - ${row.username}: ${row.product_name} ($${row.amount})`);
    });

    console.log('\n');

    // ========================================
    // STEP 4: Query ALL shards (scatter-gather)
    // ========================================
    console.log('🌐 STEP 4: Count users per shard (scatter-gather query)\n');

    const allCounts = await shardManager.queryAllShards('SELECT COUNT(*) as count FROM users');

    let totalUsers = 0;
    allCounts.forEach(result => {
      const count = parseInt(result.rows[0].count);
      totalUsers += count;
      console.log(`  Shard ${result.shardIndex}: ${count} users`);
    });
    console.log(`  Total across all shards: ${totalUsers} users`);

    console.log('\n');

    // ========================================
    // STEP 5: Show data distribution
    // ========================================
    console.log('📊 STEP 5: Show how data is distributed\n');

    const allUsers = await shardManager.queryAllShards('SELECT id, username FROM users ORDER BY id');

    allUsers.forEach(result => {
      console.log(`  Shard ${result.shardIndex} contains:`);
      result.rows.forEach(user => {
        console.log(`    - User ${user.id} (${user.username}) [${user.id} % 3 = ${user.id % 3}]`);
      });
    });

    console.log('\n');
    console.log('='.repeat(60));
    console.log('KEY TAKEAWAYS:');
    console.log('='.repeat(60));
    console.log(`
1. SHARD KEY SELECTION is critical
   - We use user_id as our shard key
   - All user data (users + orders) lives on the same shard
   - This allows efficient JOINs within a shard

2. HASH-BASED SHARDING: user_id % number_of_shards
   - ID 1 -> 1 % 3 = 1 -> Shard 1
   - ID 2 -> 2 % 3 = 2 -> Shard 2
   - ID 3 -> 3 % 3 = 0 -> Shard 0
   - This distributes data evenly

3. SINGLE-SHARD QUERIES are fast
   - When you know the shard key, query goes to one DB

4. SCATTER-GATHER QUERIES are expensive
   - Queries without shard key must hit ALL shards
   - Avoid these in production when possible

5. CO-LOCATION matters
   - Related data should share the same shard key
   - Orders are sharded by user_id, not order_id
`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await shardManager.close();
  }
}

main();
