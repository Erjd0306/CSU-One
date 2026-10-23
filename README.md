# CSU-One

CSU-One is a responsive campus issue-reporting prototype for **Cagayan State University – Carig Campus** (Carig Sur, Tuguegarao City, Cagayan). Students report physical problems around campus, administrators review and assign them, and maintenance personnel carry out and close the repairs.

## Technology

- React + TypeScript (strict)
- Tailwind CSS
- Vite
- Lucide React icons
- Leaflet + React Leaflet with OpenStreetMap tiles

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL shown in the terminal.

Production build: `npm run build` (output in `dist`).

## Test accounts

Only these accounts can log in. You can sign in with the email or the ID number.

| Role | Email | ID number | Password |
| --- | --- | --- | --- |
| Student | mark.esteban@csu.edu.ph | 23-01234 | Student@2026 |
| Administrator | lebron.james@csu.edu.ph | ADM-0001 | Admin@2026 |
| Maintenance | michael.jordan@csu.edu.ph | MNT-0107 | Maint@2026 |

## Workflow

Open → Assigned → In Progress → Resolved

1. A student submits a report (status **Open**).
2. An administrator assigns it to maintenance personnel (**Assigned**).
3. The assignee accepts the task and starts the repair (**In Progress**).
4. The assignee marks it as resolved (**Resolved**). Administrators can reopen it.

Every change is written to the report timeline, sends notifications, and updates all dashboards. Data is saved in `localStorage`, so it survives page refreshes and stays in sync across open tabs. Use **Profile → Reset data** to restore the original sample data.

## Map data

- The campus center (17.659049, 121.753178) comes from the official CSU campus listing at https://csu.edu.ph/campuses.
- The campus boundary is the OpenStreetMap university polygon (way 976242857).
- Building names and coordinates are the named OpenStreetMap features inside that boundary.

Map data © OpenStreetMap contributors. If the map cannot load, the report form falls back to a building dropdown.

## Project structure

```
src/
  data/        campus.ts (verified geography), mockData.ts (prototype data)
  state/       AppStore.tsx (workflow + persistence), Toast.tsx
  lib/         router, storage, filters, analytics, formatting, image compression
  components/  layout (shell, sidebar, bottom nav), map, reports, charts, ui
  pages/       landing, login, student/, admin/, maintenance/, shared/
```
