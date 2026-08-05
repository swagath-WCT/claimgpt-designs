# ClaimGPT — Implementation Summary & Recent Updates

## Overview of Changes Made

### 1. Extracted Claim Data Sync & Auto-Reloading (No Page Refresh Required)
- **Problem**: Uploading a claim required a manual page refresh or clicking "Full Audit Report" for patient metadata and report preview fields to update on screen.
- **Fix**:
  - Polling in `use-auditor-state.ts` (`tryFetchPreview` and `runProgressSequence`) now checks for non-empty extracted fields (`patient_name`, `hospital`, `diagnosis`, or `COMPLETED` status) before concluding.
  - Introduced `previewVersion` state counter that increments whenever fresh preview data arrives from the backend.
  - Bound container `key` in all 3 dashboard designs (`dashboard-aurora.tsx`, `dashboard-clinical.tsx`, `dashboard-ledger.tsx`) to `${s.claimId}-${s.previewVersion}`, forcing uncontrolled `<Input defaultValue={...}>` elements to remount instantly when new parsing data completes.

### 2. Live Claim Report Modal Data Binding & Hooks Fix
- **Problem**: Clicking "View AI Post-Processing Audit Report" opened a modal containing static mock fallbacks ("Damien Hoeger", "Beth Israel", static ₹25,000 totals) and triggered a React `Rendered more hooks than during the previous render` crash.
- **Fix**:
  - Removed conditional `useMemo` hook placed below early return `if (!s.showReportModal) return null;`, eliminating the React Rules of Hooks crash.
  - Bound all modal sections (Patient Name, Hospital, Dates, Expenses, ICD-10, CPT codes, IRDAI rules) directly to `s.realPreview`.
  - Added a `useEffect` to sync local editable state whenever `s.realPreview` or `s.claimId` changes.

### 3. Claim Card Deletion (`X` Button) & Backend API Persistence
- **Problem**: Processed claim history cards could not be deleted from the sidebar or backend.
- **Fix**:
  - Added an interactive `X` delete icon button with `e.stopPropagation()` to claim cards across all 3 dashboard designs.
  - Added `deleteClaimApi(claimId)` in `lib/api-client.ts` calling the Docker backend's existing `DELETE /ingress/claims/{claim_id}` route.
  - Integrated `deleteClaim` in `use-auditor-state.ts` to immediately update local state and execute the backend deletion, permanently purging records from PostgreSQL DB and storage.

### 4. Mobile Header Badge & Design Switcher Layout Fixes
- **Problem**: On mobile screens (390px–430px viewports like iPhone 14 Pro Max), header badges ("NEON CYBER GLASS", "EXECUTIVE GOLD") overlapped the `EN` language switcher button.
- **Fix**:
  - Applied `whitespace-nowrap` and responsive text spans across header badges: compact labels (`NEON`, `EXECUTIVE`, `CLINICAL`) render on mobile (`< sm`), avoiding overlap with header buttons. Full badge titles display on `sm+` viewports.

### 5. Patient Profile Dropdown & Mobile Responsive Design
- **Problem**: Clicking the profile avatar displayed standard dialog modals that overflowed mobile viewports and overlapped the bottom `Design 1 | 2 | 3` floating switcher bar.
- **Fix**:
  - Created `components/claimgpt/user-profile-modal.tsx` styled after reference design specifications.
  - **Desktop (`sm+`)**: Anchors right below the top-right profile avatar (`sm:top-16 sm:right-6`).
  - **Mobile (`< sm`)**: Displays as a centered, compact backdrop-blurred dialog (`max-w-[360px] p-3`), preventing bottom nav bar overlap or horizontal viewport clipping.
  - **Registration Fields Only**: Displays exact registration fields (Full Name, Contact Email, DOB, Gender, Insurer Provider, Policy Number, Sum Insured) and lists all claims uploaded under that account (with family member tags like *Patient: Suresh [Family Member]*).

### 6. Backend Integration for User Authentication
- **Fix**:
  - Added `POST /ingress/auth/login` and `POST /ingress/auth/register` to `services/ingress/app/main.py` in `claimgpt_dockerintegrated`.
  - Added `syncUserToBackend(name, email)` in `lib/api-client.ts` to log user registration and account initialization (`ACC-USER-2026`) in the Docker PostgreSQL audit log.
  - Uploaded claim documents now pass `userName` as `policy_id` / `patient_id` to link all claims uploaded under a user's account in PostgreSQL.
