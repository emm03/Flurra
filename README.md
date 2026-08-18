# Flurra

Flurra is a social ski-day companion for exploring resorts, finding your next run, and connecting with other skiers. This repository currently contains the responsive homepage prototype built with Expo, React Native, TypeScript, and Expo Router.

## Get started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run start
```

From the Expo terminal, press `w` for web, `i` for iOS Simulator, or `a` for Android Emulator. You can also launch a target directly:

```bash
npm run web
npm run ios
npm run android
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build:web
```

## Structure

- `app/` — Expo Router routes and root layout
- `components/` — reusable homepage sections and visual elements
- `data/` — mock resort, vibe, and community report content
- `theme.ts` — shared colors and typography names

This first version intentionally uses mock data and image URLs. It does not include accounts, maps, recommendations, location services, or backend features.
