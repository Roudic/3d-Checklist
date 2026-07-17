# RIG — Kitchen Audit Systems

Glassy metric kitchen audit app (Unreal-style viewport UI) for assignments, follow-ups, and template building.

**Live:** https://roudic.github.io/3d-Checklist/

## Login

- User: `admin`
- Passcode: `1234`

## Features

- Tracking dashboard (assignments, scores, follow-up heat, kitchen pulse)
- Easy follow-ups with status chips
- Assignments dispatch + audit runner
- Template builder with switchable question types (Yes/No, Pass/Fail/N/A, Score, Temp, Checkbox, Text)
- Local persistence via `localStorage`

## Develop

```bash
npm install
npm run dev
```

Pushes to `main` auto-deploy via GitHub Actions.
