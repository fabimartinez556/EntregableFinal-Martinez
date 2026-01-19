import * as SQLite from "expo-sqlite";

let dbPromise;

export async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("app.db");
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS products_cache (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders_cache (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_createdAt
      ON orders_cache (userId, createdAt DESC);
  `);

  return db;
}

// ---- productos cache ----
export async function saveProductsCache(products) {
  const db = await getDb();
  const now = Date.now();
  const list = Array.isArray(products) ? products : [];

  for (const p of list) {
    const id = String(p.id);
    await db.runAsync(
      `INSERT INTO products_cache (id, data, updatedAt)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         data=excluded.data,
         updatedAt=excluded.updatedAt`,
      [id, JSON.stringify(p), now]
    );
  }
}

export async function readProductsCache(limit = 200) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT data FROM products_cache ORDER BY updatedAt DESC LIMIT ?`,
    [limit]
  );
  return rows.map((r) => JSON.parse(r.data));
}

export async function clearProductsCache() {
  const db = await getDb();
  await db.runAsync(`DELETE FROM products_cache`);
}

// ---- órdenes cache ----
export async function saveOrdersCache(userId, orders) {
  const db = await getDb();
  const list = Array.isArray(orders) ? orders : [];

  for (const o of list) {
    const id = String(o.id);
    const createdAt = o.createdAt ?? Date.now();
    await db.runAsync(
      `INSERT INTO orders_cache (id, userId, data, createdAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         userId=excluded.userId,
         data=excluded.data,
         createdAt=excluded.createdAt`,
      [id, String(userId), JSON.stringify(o), createdAt]
    );
  }
}

export async function readOrdersCache(userId, limit = 50) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT data FROM orders_cache WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`,
    [String(userId), limit]
  );
  return rows.map((r) => JSON.parse(r.data));
}

export async function clearOrdersCache(userId) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM orders_cache WHERE userId = ?`, [
    String(userId),
  ]);
}
