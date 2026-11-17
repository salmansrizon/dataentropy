import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCoursePage } from "./loadCoursePage";

type Query = { table: string; columns?: string; filters: [string, string, unknown][] };

/** Chainable stand-in for the Supabase query builder; every query resolves via `rows`. */
function fakeDb(rows: (q: Query) => unknown) {
  const queries: Query[] = [];
  const db = {
    from(table: string) {
      const q: Query = { table, filters: [] };
      queries.push(q);
      const builder: Record<string, unknown> = {
        select: (columns: string) => ((q.columns = columns), builder),
        then: (resolve: (r: unknown) => void) => resolve({ data: rows(q), error: null }),
      };
      for (const op of ["eq", "neq", "in", "contains", "overlaps"]) {
        builder[op] = (col: string, val: unknown) => (q.filters.push([op, col, val]), builder);
      }
      for (const op of ["order", "limit", "single", "maybeSingle"]) builder[op] = () => builder;
      return builder;
    },
  };
  return { db: db as unknown as SupabaseClient, queries };
}

const paidCourse = { id: "c1", price: 1000, discounted_price: null, is_free: false, instructor_id: null, technologies: [] };
const fullContentQueries = (queries: Query[]) =>
  queries.filter((q) => q.table === "course_content" && q.columns === "*" && !q.filters.some(([, col]) => col === "is_free"));

function rowsFor(course: object, enrolled: boolean) {
  return (q: Query) => {
    if (q.table === "courses" && q.filters.some(([op, col]) => op === "eq" && col === "id")) return course;
    if (q.table === "course_enrollments") return enrolled ? { id: "e1" } : null;
    return [];
  };
}

describe("loadCoursePage access rule", () => {
  it("never fetches full lesson payloads for a locked learner on a paid course", async () => {
    const { db, queries } = fakeDb(rowsFor(paidCourse, false));
    const page = await loadCoursePage(db, "c1", "u1");
    expect(page.paidAccess).toBe(false);
    expect(fullContentQueries(queries)).toHaveLength(0);
  });

  it("fetches full payloads once the learner holds an access-status enrollment", async () => {
    const { db, queries } = fakeDb(rowsFor(paidCourse, true));
    const page = await loadCoursePage(db, "c1", "u1");
    expect(page.paidAccess).toBe(true);
    expect(fullContentQueries(queries)).toHaveLength(1);
  });

  it("anonymous visitors skip the enrollment lookup and stay locked", async () => {
    const { db, queries } = fakeDb(rowsFor(paidCourse, true));
    await loadCoursePage(db, "c1", null);
    expect(queries.some((q) => q.table === "course_enrollments")).toBe(false);
    expect(fullContentQueries(queries)).toHaveLength(0);
  });

  it("free courses get full payloads without an enrollment", async () => {
    const { db, queries } = fakeDb(rowsFor({ ...paidCourse, is_free: true }, false));
    await loadCoursePage(db, "c1", "u1");
    expect(queries.some((q) => q.table === "course_enrollments")).toBe(false);
    expect(fullContentQueries(queries)).toHaveLength(1);
  });
});
