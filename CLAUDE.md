# CLAUDE.md - Development Guide

## Build & Development Commands
- `npm run dev` - Start local development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Manually run TypeScript checks (run `npx tsc --noEmit`)

## Project Structure
- Next.js 15 App Router project with React 19
- React Three Fiber (3D graphics) and Tailwind CSS 4
- Path aliases: `@/*` maps to `./src/*`

## Code Style Guidelines
- Use **TypeScript** with strict type checking
- Use **functional components** with React hooks
- Follow **ESLint rules** from next/core-web-vitals and next/typescript
- Use **named exports** for utility functions, **default exports** for components
- Use **className prop** with Tailwind classes for styling
- Use proper **semantic HTML** elements
- Use **Image** component from next/image for optimized images
- Ensure **a11y** compliance with proper ARIA attributes

## Error Handling
- Use **try/catch** blocks for async operations
- Include **error boundaries** for component-level error handling
- Add **fallback UI** for loading and error states