# Realtime Guestbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js guestbook that stores entries in MySQL, exposes `GET` and `POST /api/guestbook`, and refreshes the guestbook list every few seconds without a full page reload.

**Architecture:** Start from a clean Next.js App Router project. Keep MySQL access behind a small Prisma-backed service layer, keep validation in one shared module used by both the API and UI, and keep the page split into focused guestbook components. Use polling on the client instead of sockets so the first release stays simple and reliable.

**Tech Stack:** Next.js 15+, React, TypeScript, Prisma, MySQL, Zod, Vitest, React Testing Library, Testing Library DOM, jsdom

---

## File Structure

- `package.json`
  - Project scripts and dependencies for Next.js, Prisma, Vitest, and testing libraries.
- `.env.example`
  - Documents required environment variables, especially `DATABASE_URL`.
- `.gitignore`
  - Ignores `.env`, `.next`, Prisma client output, and test artifacts.
- `prisma/schema.prisma`
  - Defines the `GuestbookEntry` model and MySQL datasource.
- `src/lib/db.ts`
  - Exposes a singleton Prisma client.
- `src/lib/guestbook-schema.ts`
  - Shared Zod schema and types for guestbook input.
- `src/lib/guestbook-service.ts`
  - Contains `listGuestbookEntries()` and `createGuestbookEntry()` business logic.
- `src/app/api/guestbook/route.ts`
  - Route handlers for `GET` and `POST /api/guestbook`.
- `src/components/guestbook-form.tsx`
  - Controlled form with client-side validation and submit state.
- `src/components/guestbook-entry.tsx`
  - Displays a single guestbook row.
- `src/components/guestbook-list.tsx`
  - Displays empty state or the list of entries.
- `src/app/page.tsx`
  - Top-level page that coordinates fetch, submit refresh, and polling.
- `tests/lib/guestbook-schema.test.ts`
  - Validation tests for nickname and message constraints.
- `tests/lib/guestbook-service.test.ts`
  - Business logic tests for ordering and persistence behavior using mocks.
- `tests/api/guestbook-route.test.ts`
  - Route handler tests for success and failure responses.
- `tests/components/guestbook-form.test.tsx`
  - Form behavior tests.
- `tests/components/guestbook-page.test.tsx`
  - Page polling and refresh behavior tests.
- `vitest.config.ts`
  - Vitest configuration for Node and jsdom tests.
- `vitest.setup.ts`
  - Testing Library setup.

## Task 1: Scaffold The Project And Test Harness

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Test: `tests/components/guestbook-page.test.tsx`

- [ ] **Step 1: Scaffold Next.js, initialize git, and install the dependencies**

```bash
npx create-next-app@latest . --ts --eslint --app --src-dir --use-npm --import-alias "@/*"
git init
npm install zod prisma @prisma/client
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Expected: Next.js app files appear in the current directory, `.git` exists, and `npm install` finishes without errors.

- [ ] **Step 2: Write the failing guestbook page smoke test**

```tsx
// tests/components/guestbook-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the guestbook heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /realtime guestbook/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/components/guestbook-page.test.tsx`

Expected: FAIL because the default scaffolded page does not render a `Realtime Guestbook` heading.

- [ ] **Step 4: Replace the default page with the minimal guestbook shell and add Vitest config**

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Realtime Guestbook</h1>
      <p>Leave a message and see recent entries refresh automatically.</p>
    </main>
  );
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```env
# .env.example
DATABASE_URL="mysql://root:password@127.0.0.1:3306/realtime_guestbook"
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/components/guestbook-page.test.tsx`

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example src/app/page.tsx src/app/layout.tsx src/app/globals.css vitest.config.ts vitest.setup.ts tests/components/guestbook-page.test.tsx
git commit -m "chore: scaffold next guestbook project"
```

## Task 2: Add Shared Validation And Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `src/lib/guestbook-schema.ts`
- Test: `tests/lib/guestbook-schema.test.ts`

- [ ] **Step 1: Write the failing validation tests**

```ts
// tests/lib/guestbook-schema.test.ts
import { describe, expect, it } from "vitest";

import { guestbookInputSchema } from "@/lib/guestbook-schema";

describe("guestbookInputSchema", () => {
  it("accepts trimmed valid input", () => {
    const result = guestbookInputSchema.parse({
      nickname: "  Mina  ",
      message: "  Hello from Seoul  ",
    });

    expect(result).toEqual({
      nickname: "Mina",
      message: "Hello from Seoul",
    });
  });

  it("rejects blank nickname", () => {
    expect(() =>
      guestbookInputSchema.parse({
        nickname: "   ",
        message: "Hello",
      }),
    ).toThrow(/nickname/i);
  });

  it("rejects message longer than 300 characters", () => {
    expect(() =>
      guestbookInputSchema.parse({
        nickname: "Mina",
        message: "a".repeat(301),
      }),
    ).toThrow(/300/);
  });
});
```

- [ ] **Step 2: Run the validation tests to verify they fail**

Run: `npx vitest run tests/lib/guestbook-schema.test.ts`

Expected: FAIL because `@/lib/guestbook-schema` does not exist.

- [ ] **Step 3: Add the schema, Prisma model, and singleton database client**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model GuestbookEntry {
  id        Int      @id @default(autoincrement())
  nickname  String   @db.VarChar(20)
  message   String   @db.VarChar(300)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("guestbook_entries")
}
```

```ts
// src/lib/guestbook-schema.ts
import { z } from "zod";

export const guestbookInputSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "Nickname must be at least 2 characters.")
    .max(20, "Nickname must be 20 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(300, "Message must be 300 characters or fewer."),
});

export type GuestbookInput = z.infer<typeof guestbookInputSchema>;
```

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 4: Run the validation tests to verify they pass**

Run: `npx vitest run tests/lib/guestbook-schema.test.ts`

Expected: PASS with `3 passed`.

- [ ] **Step 5: Generate Prisma client and create the first migration**

Run: `npx prisma generate`

Expected: Prisma client is generated successfully.

Run: `npx prisma migrate dev --name init_guestbook`

Expected: A migration is created and the `guestbook_entries` table exists in MySQL.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts src/lib/guestbook-schema.ts tests/lib/guestbook-schema.test.ts prisma/migrations
git commit -m "feat: add guestbook schema and database model"
```

## Task 3: Build The Guestbook Service And API Routes

**Files:**
- Create: `src/lib/guestbook-service.ts`
- Create: `src/app/api/guestbook/route.ts`
- Test: `tests/lib/guestbook-service.test.ts`
- Test: `tests/api/guestbook-route.test.ts`

- [ ] **Step 1: Write the failing service tests**

```ts
// tests/lib/guestbook-service.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    guestbookEntry: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import {
  createGuestbookEntry,
  listGuestbookEntries,
} from "@/lib/guestbook-service";

describe("guestbook service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a trimmed guestbook entry", async () => {
    vi.mocked(db.guestbookEntry.create).mockResolvedValue({
      id: 1,
      nickname: "Mina",
      message: "Hello",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    });

    const entry = await createGuestbookEntry({
      nickname: "  Mina  ",
      message: "  Hello  ",
    });

    expect(db.guestbookEntry.create).toHaveBeenCalledWith({
      data: {
        nickname: "Mina",
        message: "Hello",
      },
    });
    expect(entry.nickname).toBe("Mina");
  });

  it("lists newest entries first and limits the result set", async () => {
    vi.mocked(db.guestbookEntry.findMany).mockResolvedValue([]);

    await listGuestbookEntries();

    expect(db.guestbookEntry.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  });
});
```

- [ ] **Step 2: Write the failing API route tests**

```ts
// tests/api/guestbook-route.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/guestbook-service", () => ({
  createGuestbookEntry: vi.fn(),
  listGuestbookEntries: vi.fn(),
}));

import { createGuestbookEntry, listGuestbookEntries } from "@/lib/guestbook-service";
import { GET, POST } from "@/app/api/guestbook/route";

describe("/api/guestbook", () => {
  it("returns guestbook entries on GET", async () => {
    vi.mocked(listGuestbookEntries).mockResolvedValue([
      {
        id: 1,
        nickname: "Mina",
        message: "Hello",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
      },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(1);
  });

  it("returns 201 on valid POST", async () => {
    vi.mocked(createGuestbookEntry).mockResolvedValue({
      id: 1,
      nickname: "Mina",
      message: "Hello",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    });

    const request = new Request("http://localhost/api/guestbook", {
      method: "POST",
      body: JSON.stringify({
        nickname: "Mina",
        message: "Hello",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

- [ ] **Step 3: Run the service and route tests to verify they fail**

Run: `npx vitest run tests/lib/guestbook-service.test.ts tests/api/guestbook-route.test.ts`

Expected: FAIL because the service and route handler files do not exist.

- [ ] **Step 4: Implement the service and route handlers**

```ts
// src/lib/guestbook-service.ts
import { db } from "@/lib/db";
import { guestbookInputSchema, type GuestbookInput } from "@/lib/guestbook-schema";

export async function listGuestbookEntries() {
  return db.guestbookEntry.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

export async function createGuestbookEntry(input: GuestbookInput) {
  const parsed = guestbookInputSchema.parse(input);

  return db.guestbookEntry.create({
    data: {
      nickname: parsed.nickname,
      message: parsed.message,
    },
  });
}
```

```ts
// src/app/api/guestbook/route.ts
import { ZodError } from "zod";

import {
  createGuestbookEntry,
  listGuestbookEntries,
} from "@/lib/guestbook-service";

export async function GET() {
  const entries = await listGuestbookEntries();

  return Response.json({ entries }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const entry = await createGuestbookEntry(json);

    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid guestbook entry.",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to save your entry right now." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 5: Run the service and route tests to verify they pass**

Run: `npx vitest run tests/lib/guestbook-service.test.ts tests/api/guestbook-route.test.ts`

Expected: PASS with `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/guestbook-service.ts src/app/api/guestbook/route.ts tests/lib/guestbook-service.test.ts tests/api/guestbook-route.test.ts
git commit -m "feat: add guestbook api routes"
```

## Task 4: Build The Guestbook Form And List Components

**Files:**
- Create: `src/components/guestbook-form.tsx`
- Create: `src/components/guestbook-entry.tsx`
- Create: `src/components/guestbook-list.tsx`
- Test: `tests/components/guestbook-form.test.tsx`

- [ ] **Step 1: Write the failing form behavior tests**

```tsx
// tests/components/guestbook-form.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GuestbookForm } from "@/components/guestbook-form";

describe("GuestbookForm", () => {
  it("shows a validation error before submit when message is blank", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<GuestbookForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nickname/i), "Mina");
    await user.click(screen.getByRole("button", { name: /sign guestbook/i }));

    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values and clears the form on success", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<GuestbookForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nickname/i), "  Mina  ");
    await user.type(screen.getByLabelText(/message/i), "  Hello  ");
    await user.click(screen.getByRole("button", { name: /sign guestbook/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      nickname: "Mina",
      message: "Hello",
    });
    expect(screen.getByLabelText(/nickname/i)).toHaveValue("");
  });
});
```

- [ ] **Step 2: Run the form tests to verify they fail**

Run: `npx vitest run tests/components/guestbook-form.test.tsx`

Expected: FAIL because the form component does not exist.

- [ ] **Step 3: Implement the form and list components**

```tsx
// src/components/guestbook-form.tsx
"use client";

import { useState } from "react";

import { guestbookInputSchema, type GuestbookInput } from "@/lib/guestbook-schema";

type GuestbookFormProps = {
  onSubmit: (values: GuestbookInput) => Promise<void>;
};

export function GuestbookForm({ onSubmit }: GuestbookFormProps) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = guestbookInputSchema.safeParse({ nickname, message });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(result.data);
      setNickname("");
      setMessage("");
    } catch {
      setError("Unable to save your entry right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nickname
        <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
      </label>
      <label>
        Message
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Sign Guestbook"}
      </button>
    </form>
  );
}
```

```tsx
// src/components/guestbook-entry.tsx
type GuestbookEntryProps = {
  nickname: string;
  message: string;
  createdAt: string;
};

export function GuestbookEntry({
  nickname,
  message,
  createdAt,
}: GuestbookEntryProps) {
  return (
    <article>
      <header>
        <strong>{nickname}</strong>
        <time dateTime={createdAt}>
          {new Date(createdAt).toLocaleString()}
        </time>
      </header>
      <p>{message}</p>
    </article>
  );
}
```

```tsx
// src/components/guestbook-list.tsx
import { GuestbookEntry } from "@/components/guestbook-entry";

type GuestbookListItem = {
  id: number;
  nickname: string;
  message: string;
  createdAt: string;
};

type GuestbookListProps = {
  entries: GuestbookListItem[];
};

export function GuestbookList({ entries }: GuestbookListProps) {
  if (entries.length === 0) {
    return <p>Be the first to leave a message.</p>;
  }

  return (
    <section aria-label="Guestbook entries">
      {entries.map((entry) => (
        <GuestbookEntry key={entry.id} {...entry} />
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Run the form tests to verify they pass**

Run: `npx vitest run tests/components/guestbook-form.test.tsx`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/guestbook-form.tsx src/components/guestbook-entry.tsx src/components/guestbook-list.tsx tests/components/guestbook-form.test.tsx
git commit -m "feat: add guestbook form and list components"
```

## Task 5: Connect The Page To The API With Polling

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/components/guestbook-page.test.tsx`

- [ ] **Step 1: Replace the smoke test with failing page interaction tests**

```tsx
// tests/components/guestbook-page.test.tsx
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";

const fetchMock = vi.fn();

describe("HomePage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  it("loads entries and refreshes them after a successful submit", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            entries: [],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            entry: {
              id: 1,
              nickname: "Mina",
              message: "Hello",
              createdAt: "2026-07-01T00:00:00.000Z",
            },
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            entries: [
              {
                id: 1,
                nickname: "Mina",
                message: "Hello",
                createdAt: "2026-07-01T00:00:00.000Z",
              },
            ],
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomePage />);

    await user.type(screen.getByLabelText(/nickname/i), "Mina");
    await user.type(screen.getByLabelText(/message/i), "Hello");
    await user.click(screen.getByRole("button", { name: /sign guestbook/i }));

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });

  it("polls for fresh entries every five seconds", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ entries: [] }), { status: 200 }),
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run the page tests to verify they fail**

Run: `npx vitest run tests/components/guestbook-page.test.tsx`

Expected: FAIL because the page does not yet fetch data, submit entries, or poll.

- [ ] **Step 3: Implement page fetch, submit, and polling behavior**

```tsx
// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";

import { GuestbookForm } from "@/components/guestbook-form";
import { GuestbookList } from "@/components/guestbook-list";
import type { GuestbookInput } from "@/lib/guestbook-schema";

type GuestbookEntry = {
  id: number;
  nickname: string;
  message: string;
  createdAt: string;
};

export default function HomePage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState("Loading guestbook...");

  async function loadEntries() {
    const response = await fetch("/api/guestbook", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      setStatus("Unable to refresh entries right now.");
      return;
    }

    const body = (await response.json()) as { entries: GuestbookEntry[] };
    setEntries(body.entries);
    setStatus(body.entries.length === 0 ? "No entries yet." : "");
  }

  async function submitEntry(values: GuestbookInput) {
    const response = await fetch("/api/guestbook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Failed to create entry");
    }

    await loadEntries();
    setStatus("Entry saved.");
  }

  useEffect(() => {
    void loadEntries();

    const intervalId = window.setInterval(() => {
      void loadEntries();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main>
      <h1>Realtime Guestbook</h1>
      <p>Leave a message and see recent entries refresh automatically.</p>
      <GuestbookForm onSubmit={submitEntry} />
      {status ? <p>{status}</p> : null}
      <GuestbookList entries={entries} />
    </main>
  );
}
```

- [ ] **Step 4: Run the page tests to verify they pass**

Run: `npx vitest run tests/components/guestbook-page.test.tsx`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Run the full test suite**

Run: `npx vitest run`

Expected: PASS with all component, service, schema, and route tests green.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx tests/components/guestbook-page.test.tsx
git commit -m "feat: wire guestbook page to api polling"
```

## Task 6: Manual Verification And Developer Notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add local run instructions and MySQL setup notes**

```md
## Realtime Guestbook

### Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your local MySQL instance, for example:
   `mysql://root:password@127.0.0.1:3306/realtime_guestbook`
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Run `npx prisma migrate dev --name init_guestbook`.
6. Run `npm run dev`.

### Manual verification

1. Open `http://localhost:3000`.
2. Submit a valid nickname and message.
3. Confirm the new entry appears immediately.
4. Open a second browser window and confirm new entries appear within 5 seconds.
5. Try blank input and confirm validation errors appear.
```

- [ ] **Step 2: Run the app locally for a manual smoke check**

Run: `npm run dev`

Expected: Next.js starts on `http://localhost:3000`.

Run: `npx prisma studio`

Expected: The saved guestbook entries are visible in Prisma Studio.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add guestbook setup instructions"
```

## Self-Review

### Spec coverage

- MySQL persistence: covered by Task 2 schema and migration plus Task 3 service layer.
- `GET` and `POST /api/guestbook`: covered by Task 3.
- Nickname, message, created time model: covered by Task 2 schema and Task 4 rendering.
- 3 to 5 second auto refresh: covered by Task 5 polling.
- Client and server validation: covered by Task 2 shared schema, Task 3 API error handling, and Task 4 form validation.
- Empty state and failure resilience: covered by Task 4 list rendering and Task 5 page status handling.
- Core API and UI testing: covered by Tasks 1, 2, 3, 4, and 5.

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation notes appear in the task steps.
- Each test and code-writing step includes an explicit code block.
- Every command step includes an exact command and an expected outcome.

### Type consistency

- Shared input type is `GuestbookInput` from `src/lib/guestbook-schema.ts`.
- Database model uses `createdAt` in Prisma and maps it to `created_at` in MySQL.
- UI consumes serialized `createdAt` strings while service and route tests use the same field name consistently.
