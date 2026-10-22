# Banner With Configurable Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the supplied IS TV banner and let an administrator set the destination opened when a visitor clicks it.

**Architecture:** Extend the existing dynamic banner record with an optional `enlace` field. The admin sends it at upload time, the API persists and returns it, and the home-page slider renders each banner as a normal link when a destination is present.

**Tech Stack:** React 19, TypeScript, Express, SQLite, Vite.

**Spec:** User request of 2026-10-06: add `Banner web IS TV 1823 x 863.png` and provide an option to link the banner click to the form. (The supplied file's actual dimensions are 1536 × 1024.)

## Global Constraints

- Preserve the existing banner upload and deletion workflow.
- The banner destination is optional; `#formulario` must be usable as the destination.
- Only the existing authenticated agency/superadmin roles may create banners.

## Review Focus

- Existing databases without the new column migrate on startup and continue listing banners.
- A blank destination leaves the banner visible without a broken clickable wrapper.
- `#formulario` scrolls to the home-page form without triggering the football-plan side effects.
- A banner destination can be an internal route or a valid external URL.
- The provided PNG retains its 1536 × 1024 intrinsic dimensions and is uploaded through the existing admin UI.

---

### Task 1: Persist the optional banner destination

**Files:**
- Modify: `backend/src/db.js`
- Modify: `backend/src/routes/agencias.js`
- Test: `backend/test/banners.test.js`

**Interfaces:**
- Produces: `GET /api/agencias/:id/banners` records shaped as `{ id: string, imagen: string, enlace: string | null }`.
- Consumes: authenticated `POST /api/agencias/:id/banners` JSON with `imagen: string` and optional `enlace: string`.

- [ ] **Step 1: Write failing API tests**

Test that posting a valid image with `enlace: '#formulario'` stores it and that the public list returns the same link; test that an omitted link returns `null` (or an empty normalized value).

- [ ] **Step 2: Run the banner API tests to verify they fail**

Run: `npm test --prefix backend -- banners.test.js`
Expected: FAIL because `enlace` is not persisted or returned.

- [ ] **Step 3: Add the schema migration and route support**

Create `banners.enlace` as a nullable text column for new and existing SQLite databases. Insert the optional field and select it in the list query, preserving authorization and image validation.

- [ ] **Step 4: Run the banner API tests to verify they pass**

Run: `npm test --prefix backend -- banners.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/db.js backend/src/routes/agencias.js backend/test/banners.test.js
git commit -m "feat: store banner destinations"
```

### Task 2: Configure and render banner links

**Files:**
- Modify: `frontend/src/pages/AdminPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`
- Modify: `frontend/src/components/Hero.tsx`
- Modify: `frontend/src/components/Hero.module.css`
- Add: `frontend/src/types/banner.ts`
- Test: `frontend/src/components/Hero.test.tsx`

**Interfaces:**
- Consumes: banner objects from Task 1.
- Produces: an upload control for image plus optional destination and a slider whose linked banners navigate to that destination.

- [ ] **Step 1: Write failing component tests**

Test that a banner with `enlace: '#formulario'` renders an anchor with that `href`, and that a banner with no destination renders its image without an anchor.

- [ ] **Step 2: Run the component tests to verify they fail**

Run: `npm test --prefix frontend -- Hero.test.tsx`
Expected: FAIL because dynamic banners are currently rendered only as images.

- [ ] **Step 3: Implement the shared banner type and UI**

Use `{ id: string; imagen: string; enlace?: string | null }` throughout the frontend. Add an optional “Enlace al hacer clic” field beside upload, submit it with the image, and conditionally wrap the slider image in an anchor. Keep the default static banner behavior unchanged.

- [ ] **Step 4: Run the component tests to verify they pass**

Run: `npm test --prefix frontend -- Hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/AdminPage.tsx frontend/src/App.tsx frontend/src/pages/HomePage.tsx frontend/src/components/Hero.tsx frontend/src/components/Hero.module.css frontend/src/types/banner.ts frontend/src/components/Hero.test.tsx
git commit -m "feat: add configurable banner links"
```

### Task 3: Add the supplied IS TV banner

**Files:**
- Add: `frontend/public/Banner web IS TV 1823 x 863.png`
- Test: `frontend` production build

**Interfaces:**
- Consumes: user-supplied `Banner web IS TV 1823 x 863.png` at repository root.
- Produces: a deployable static asset, ready to be selected/uploaded from the admin panel with `#formulario` as its destination.

- [ ] **Step 1: Verify the supplied asset exists and has expected dimensions**

Run: `file "Banner web IS TV 1823 x 863.png"`
Expected: PNG image, 1536 × 1024.

- [ ] **Step 2: Place the image in the public assets directory**

Copy the supplied PNG unchanged to `frontend/public/` so it is included in the production build.

- [ ] **Step 3: Run lint and production build**

Run: `npm run lint --prefix frontend && npm run build --prefix frontend`
Expected: both commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add "frontend/public/Banner web IS TV 1823 x 863.png"
git commit -m "feat: add IS TV banner asset"
```
