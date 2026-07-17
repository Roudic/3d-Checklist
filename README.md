# RIG — Task & Checklist Systems

A glassy metric checklist app with Unreal Engine viewport vibes.

**Live (after Pages is enabled):** https://roudic.github.io/3d-Checklist/

## Deploy (GitHub Pages)

The site is built and ready. Enable hosting once:

1. Open **[Settings → Pages](https://github.com/Roudic/3d-Checklist/settings/pages)**
2. Under **Build and deployment → Source**, choose either:
   - **GitHub Actions** (preferred — then re-run the failed *Deploy to GitHub Pages* workflow), or
   - **Deploy from a branch** → `gh-pages` / `/` (static build already pushed)

## Features

- Multiple checklists with rename / delete
- Tasks with priority (low / mid / high) and complete toggle
- Glass metric strip: completion %, open load, priority heat, viewport filters
- Local persistence via `localStorage`
- Perspective grid atmosphere and subtle motion

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
