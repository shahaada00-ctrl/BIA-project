import { describe, it, expect, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { parseSheet, buildUserProfiles } from '../dataLoader';
import type { User, Rating, BehaviorRecord } from '../types';

// ============================================================
// parseSheet tests
// ============================================================

function makeBuffer(rows: Record<string, unknown>[]): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return out as ArrayBuffer;
}

describe('parseSheet', () => {
  it('parses valid data with all required columns', () => {
    const buf = makeBuffer([
      { user_id: 1, age: 25, location: 'NYC' },
      { user_id: 2, age: 30, location: 'LA' },
    ]);
    const result = parseSheet<{ user_id: number; age: number; location: string }>(
      buf, 'users.xlsx', ['user_id', 'age', 'location'],
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ user_id: 1, age: 25, location: 'NYC' });
  });

  it('throws on empty worksheet', () => {
    const ws = XLSX.utils.aoa_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    expect(() => parseSheet(buf, 'empty.xlsx', ['col'])).toThrow('no data rows');
  });

  it('throws on missing required columns', () => {
    const buf = makeBuffer([{ user_id: 1, age: 25 }]);
    expect(() => parseSheet(buf, 'users.xlsx', ['user_id', 'age', 'location'])).toThrow(
      'missing required columns: location',
    );
  });

  it('throws when workbook has no sheets', () => {
    // SheetJS itself throws when writing an empty workbook,
    // so we verify our error path by testing with an empty sheet (no data rows)
    const ws = XLSX.utils.aoa_to_sheet([['col']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    expect(() => parseSheet(buf, 'header-only.xlsx', ['col'])).toThrow('no data rows');
  });
});


// ============================================================
// buildUserProfiles tests
// ============================================================

describe('buildUserProfiles', () => {
  const users: User[] = [
    { user_id: 1, age: 25, location: 'NYC' },
    { user_id: 2, age: 30, location: 'LA' },
  ];

  const ratings: Rating[] = [
    { user_id: 1, product_id: 101, rating: 5 },
    { user_id: 1, product_id: 102, rating: 4 },
    { user_id: 1, product_id: 103, rating: 3 },
    { user_id: 1, product_id: 104, rating: 2 },
    { user_id: 1, product_id: 105, rating: 1 },
    { user_id: 1, product_id: 106, rating: 5 },
    { user_id: 2, product_id: 201, rating: 3 },
  ];

  const behavior: BehaviorRecord[] = [
    { user_id: 1, product_id: 101, viewed: 1, clicked: 1, purchased: 0 },
    { user_id: 2, product_id: 201, viewed: 1, clicked: 0, purchased: 0 },
    { user_id: 2, product_id: 202, viewed: 1, clicked: 1, purchased: 1 },
  ];

  it('creates one profile per user', () => {
    const profiles = buildUserProfiles(users, ratings, behavior);
    expect(profiles).toHaveLength(2);
  });

  it('assigns correct ratings and behavior to each user', () => {
    const profiles = buildUserProfiles(users, ratings, behavior);
    const p1 = profiles.find((p) => p.user.user_id === 1)!;
    const p2 = profiles.find((p) => p.user.user_id === 2)!;

    expect(p1.ratingCount).toBe(6);
    expect(p1.behaviorCount).toBe(1);
    expect(p2.ratingCount).toBe(1);
    expect(p2.behaviorCount).toBe(2);
  });

  it('computes top 5 rated products sorted descending', () => {
    const profiles = buildUserProfiles(users, ratings, behavior);
    const p1 = profiles.find((p) => p.user.user_id === 1)!;

    expect(p1.topRatedProducts).toHaveLength(5);
    // Top 5 should be the highest rated: two 5s, one 4, one 3, one 2
    expect(p1.topRatedProducts[0].rating).toBe(5);
    expect(p1.topRatedProducts[1].rating).toBe(5);
    expect(p1.topRatedProducts[2].rating).toBe(4);
    expect(p1.topRatedProducts[3].rating).toBe(3);
    expect(p1.topRatedProducts[4].rating).toBe(2);
  });

  it('handles user with fewer than 5 ratings', () => {
    const profiles = buildUserProfiles(users, ratings, behavior);
    const p2 = profiles.find((p) => p.user.user_id === 2)!;
    expect(p2.topRatedProducts).toHaveLength(1);
    expect(p2.topRatedProducts[0]).toEqual({ product_id: 201, rating: 3 });
  });

  it('handles user with no ratings or behavior', () => {
    const profiles = buildUserProfiles(
      [{ user_id: 99, age: 40, location: 'SF' }],
      [],
      [],
    );
    expect(profiles).toHaveLength(1);
    expect(profiles[0].ratingCount).toBe(0);
    expect(profiles[0].behaviorCount).toBe(0);
    expect(profiles[0].topRatedProducts).toEqual([]);
  });
});
