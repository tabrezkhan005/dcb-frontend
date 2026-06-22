# DCB AP — Pilot testing guide

## Production API

```
https://d6pvhtk154tym.cloudfront.net
```

Set in `.env`:

```env
EXPO_PUBLIC_API_URL=https://d6pvhtk154tym.cloudfront.net
```

## Seed users (all roles)

Passwords are set by `prisma/seed.ts` on the production database.

| Role | Phone | Password |
|------|-------|----------|
| Admin | `9000000001` | `Admin@123` |
| Chairman | `9000000002` | `Chairman@123` |
| Accounts | `9000000003` | `Accounts@123` |
| Inspector | `9000000004` | `Inspector@123` |

**Device lock:** First login on a device registers that device for the user. To test all roles on one phone, log out between users (same device ID is fine). If you see *"Device not authorized"*, an admin can reset the user’s device from **Admin → Users → [user] → Reset device**.

## Local dev

```powershell
cd D:\dcb-frontend
npm ci
npx expo start -c
```

## Role test checklist

### Inspector (`9000000004`)
- [ ] Dashboard loads assigned demands
- [ ] Open demand detail → Collect payment
- [ ] Submit collection (cash/UPI)
- [ ] Receipts tab lists submission
- [ ] Profile → logout

### Accounts (`9000000003`)
- [ ] Pending collections queue
- [ ] Accept a collection
- [ ] Query a collection with note
- [ ] Verified / register tabs

### Admin (`9000000001`)
- [ ] Dashboard KPIs
- [ ] Create demand, assign inspector
- [ ] Users list / create user
- [ ] Institutions (More → Institutions)
- [ ] Audit log

### Chairman (`9000000002`)
- [ ] State-wide summary
- [ ] Analytics charts
- [ ] Export CSV (reports tab)

## CI / deploy pipeline

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `frontend-ci.yml` | Push / PR | `tsc` + Expo config validation |
| `eas-build.yml` | Manual | Android APK/AAB via EAS |

### One-time EAS setup

1. `npm install -g eas-cli` and `eas login`
2. `eas init` (links project, sets `extra.eas.projectId` in app config)
3. GitHub secret `EXPO_TOKEN` from [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
4. Actions → **EAS Build** → Run workflow → profile `preview` (APK for sideload)

### Build profiles (`eas.json`)

- **preview** — internal APK, production API URL baked in
- **production** — Play Store app bundle

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bundler: `babel-preset-expo` missing | `npx expo install babel-preset-expo` |
| Login fails / network | Check `.env` URL; phone must reach internet |
| 401 after idle | Session refresh; re-login if refresh expired |
| Charts empty | Seed data is Guntur district; chairman sees aggregates |
