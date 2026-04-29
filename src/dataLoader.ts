import * as XLSX from 'xlsx';
import type { User, Product, Rating, BehaviorRecord, UserProfile } from './types';

// ============================================================
// Helpers
// ============================================================

export async function fetchExcelBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load file "${url}": server responded with ${response.status} ${response.statusText}`,
    );
  }
  return response.arrayBuffer();
}

export function parseSheet<T>(
  buffer: ArrayBuffer,
  fileName: string,
  requiredColumns: string[],
): T[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error(`"${fileName}" contains no worksheets.`);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    throw new Error(`"${fileName}" contains no data rows.`);
  }

  // Validate that every required column is present in the first row
  const firstRowKeys = Object.keys(rows[0]);
  const missing = requiredColumns.filter((col) => !firstRowKeys.includes(col));
  if (missing.length > 0) {
    throw new Error(
      `"${fileName}" is missing required columns: ${missing.join(', ')}. Found columns: ${firstRowKeys.join(', ')}`,
    );
  }

  return rows as T[];
}

// ============================================================
// Data Loaders
// ============================================================

export async function loadUsers(): Promise<User[]> {
  const url = '/UNI/users.xlsx';
  const buffer = await fetchExcelBuffer(url);
  const rows = parseSheet<Record<string, unknown>>(buffer, 'users.xlsx', ['user_id', 'age', 'country']);
  return rows.map((row) => ({
    user_id: Number(row.user_id),
    age: Number(row.age),
    location: String(row.country),
  }));
}

export async function loadProducts(): Promise<Product[]> {
  const url = '/UNI/products.xlsx';
  const buffer = await fetchExcelBuffer(url);
  const rows = parseSheet<Product>(buffer, 'products.xlsx', ['product_id', 'category', 'price']);
  return rows.map((row) => ({
    product_id: Number(row.product_id),
    category: String(row.category),
    price: Number(row.price),
  }));
}

export async function loadRatings(): Promise<Rating[]> {
  const url = '/UNI/ratings.xlsx';
  const buffer = await fetchExcelBuffer(url);
  const rows = parseSheet<Rating>(buffer, 'ratings.xlsx', ['user_id', 'product_id', 'rating']);
  return rows.map((row) => ({
    user_id: Number(row.user_id),
    product_id: Number(row.product_id),
    rating: Number(row.rating),
  }));
}

export async function loadBehavior(): Promise<BehaviorRecord[]> {
  const url = '/UNI/behavior_15500.xlsx';
  const buffer = await fetchExcelBuffer(url);
  const rows = parseSheet<BehaviorRecord>(buffer, 'behavior_15500.xlsx', [
    'user_id',
    'product_id',
    'viewed',
    'clicked',
    'purchased',
  ]);
  return rows.map((row) => ({
    user_id: Number(row.user_id),
    product_id: Number(row.product_id),
    viewed: Number(row.viewed),
    clicked: Number(row.clicked),
    purchased: Number(row.purchased),
  }));
}

// ============================================================
// User Profile Builder
// ============================================================

export function buildUserProfiles(
  users: User[],
  ratings: Rating[],
  behavior: BehaviorRecord[],
): UserProfile[] {
  // Index ratings by user_id
  const ratingsByUser = new Map<number, Rating[]>();
  for (const r of ratings) {
    const list = ratingsByUser.get(r.user_id);
    if (list) {
      list.push(r);
    } else {
      ratingsByUser.set(r.user_id, [r]);
    }
  }

  // Index behavior by user_id
  const behaviorByUser = new Map<number, BehaviorRecord[]>();
  for (const b of behavior) {
    const list = behaviorByUser.get(b.user_id);
    if (list) {
      list.push(b);
    } else {
      behaviorByUser.set(b.user_id, [b]);
    }
  }

  return users.map((user) => {
    const userRatings = ratingsByUser.get(user.user_id) ?? [];
    const userBehavior = behaviorByUser.get(user.user_id) ?? [];

    // Top 5 rated products: sort by rating descending, take first 5
    const topRatedProducts = [...userRatings]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((r) => ({ product_id: r.product_id, rating: r.rating }));

    return {
      user: user,
      ratings: userRatings,
      behavior: userBehavior,
      ratingCount: userRatings.length,
      behaviorCount: userBehavior.length,
      topRatedProducts,
    };
  });
}
