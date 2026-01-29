# Global Error Handling Implementation Plan

## Goal Description
Implement comprehensive global error handling to ensure users see a friendly UI instead of a crash stack trace. This includes handling runtime errors in pages/components and global layout errors.

## User Review Required
> [!NOTE]
> I will be adding `global-error.tsx` which replaces the root layout on error. This requires its own `<html>` and `<body>` tags.

## Proposed Changes

### App Root
#### [NEW] [error.tsx](file:///c:/Users/701ks/Downloads/web_app/harutuja/app/error.tsx)
- React Client Component.
- Catches errors in `page.tsx` and children.
- Displays a friendly error message and a "Try again" or "Go Home" button.

#### [NEW] [global-error.tsx](file:///c:/Users/701ks/Downloads/web_app/harutuja/app/global-error.tsx)
- Catch-all for root layout errors.
- Must define its own `html` and `body` tags.
- Similar UI to `error.tsx`.

#### [NEW] [not-found.tsx](file:///c:/Users/701ks/Downloads/web_app/harutuja/app/not-found.tsx)
- Custom 404 page to match the error handling design.
- "Page not found" message and "Go Home" button.

## Verification Plan

### Manual Verification
- **Route Error**: Temporarily throw an error in a page component and verify `error.tsx` renders.
- **404**: Navigate to a non-existent URL and verify `not-found.tsx` renders.
- **Global Error**: Harder to trigger manually in dev without intentional sabotage of `layout.tsx`, but code structure will be verified against Next.js docs.
