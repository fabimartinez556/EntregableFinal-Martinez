const P_KEY = "products_cache_v1";
const O_KEY = (userId) => `orders_cache_v1_${userId}`;

export async function getDb() {
  return null;
}

export async function initDb() {
  return null;
}

export async function saveProductsCache(products) {
  const now = Date.now();
  const list = Array.isArray(products) ? products : [];
  localStorage.setItem(P_KEY, JSON.stringify({ now, list }));
}

export async function readProductsCache(limit = 200) {
  try {
    const raw = localStorage.getItem(P_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.list) ? parsed.list : [];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearProductsCache() {
  localStorage.removeItem(P_KEY);
}

export async function saveOrdersCache(userId, orders) {
  const now = Date.now();
  const list = Array.isArray(orders) ? orders : [];
  localStorage.setItem(O_KEY(userId), JSON.stringify({ now, list }));
}

export async function readOrdersCache(userId, limit = 50) {
  try {
    const raw = localStorage.getItem(O_KEY(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.list) ? parsed.list : [];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearOrdersCache(userId) {
  localStorage.removeItem(O_KEY(userId));
}
