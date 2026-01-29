# React Best Practices

**Version 0.1.0**
Vercel Engineering
January 2026

> **Note:**
> This document is mainly for agents and LLMs to follow when maintaining,
> generating, or refactoring React and Next.js codebases. Humans
> may also find it useful, but guidance here is optimized for automation
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive performance optimization guide for React and Next.js applications, designed for AI agents and LLMs. Contains 40+ rules across 8 categories, prioritized by impact from critical (eliminating waterfalls, reducing bundle size) to incremental (advanced patterns). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. [Eliminating Waterfalls](#1-eliminating-waterfalls) — **CRITICAL**
2. [Bundle Size Optimization](#2-bundle-size-optimization) — **CRITICAL**
3. [Server-Side Performance](#3-server-side-performance) — **HIGH**
4. [Client-Side Data Fetching](#4-client-side-data-fetching) — **MEDIUM-HIGH**
5. [Re-render Optimization](#5-re-render-optimization) — **MEDIUM**
6. [Rendering Performance](#6-rendering-performance) — **MEDIUM**
7. [JavaScript Performance](#7-javascript-performance) — **LOW-MEDIUM**
8. [Advanced Patterns](#8-advanced-patterns) — **LOW**

---

## 1. Eliminating Waterfalls

**Impact: CRITICAL**

Waterfalls are the #1 performance killer. Each sequential await adds full network latency.

### Key Patterns:

- **Defer await until needed** - Move `await` into branches where data is actually used
- **Use Promise.all()** - For independent async operations
- **Start promises early, await late** - Begin fetches immediately, await when needed
- **Use Suspense boundaries** - Stream content to show wrapper UI faster

---

## 2. Bundle Size Optimization

**Impact: CRITICAL**

### Key Patterns:

- **Avoid barrel file imports** - Import directly from source files
- **Use dynamic imports** - For heavy components not needed on initial render
- **Defer third-party libraries** - Load analytics, logging after hydration
- **Preload on user intent** - Load bundles on hover/focus before click

---

## 3. Server-Side Performance

**Impact: HIGH**

### Key Patterns:

- **React.cache()** - Per-request deduplication
- **LRU cache** - Cross-request caching
- **Minimize serialization** - Only pass needed fields across RSC boundaries
- **Parallel component composition** - Restructure for concurrent data fetching

---

## 4. Client-Side Data Fetching

**Impact: MEDIUM-HIGH**

### Key Patterns:

- **SWR** - Automatic request deduplication and caching
- **useSWRSubscription** - Share global event listeners

---

## 5. Re-render Optimization

**Impact: MEDIUM**

### Key Patterns:

- **Defer state reads** - Read searchParams/localStorage in callbacks, not subscriptions
- **Extract memoized components** - Enable early returns before computation
- **Narrow effect dependencies** - Use primitives instead of objects
- **Lazy state initialization** - Pass functions to useState for expensive values
- **startTransition** - Mark non-urgent updates

---

## 6. Rendering Performance

**Impact: MEDIUM**

### Key Patterns:

- **Animate SVG wrappers** - Not SVG elements directly
- **content-visibility: auto** - Defer off-screen rendering
- **Hoist static JSX** - Avoid recreating elements
- **Prevent hydration mismatch** - Use inline scripts for client-only data

---

## 7. JavaScript Performance

**Impact: LOW-MEDIUM**

### Key Patterns:

- **Batch DOM CSS changes** - Via classes or cssText
- **Build index maps** - For repeated lookups
- **Cache function results** - Module-level Map
- **toSorted() over sort()** - Immutable array operations
- **Early length check** - Before expensive array comparisons

---

## 8. Advanced Patterns

**Impact: LOW**

### Key Patterns:

- **Store handlers in refs** - Stable subscriptions
- **useLatest** - Access latest values without dependency changes

---

## References

1. [https://react.dev](https://react.dev)
2. [https://nextjs.org](https://nextjs.org)
3. [https://swr.vercel.app](https://swr.vercel.app)
4. [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
