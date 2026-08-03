# Draft Command

Personal fantasy football draft prep tool with Sleeper league integration.

## Features

- **Draft Board**: Full player rankings with position filters, search, Sleeper ADP comparison, and pick value tracking
- **Tiers**: Players grouped by custom tier definitions with availability counts
- **My Team**: Live roster tracker with positional needs
- **Sleeper Integration**: Connect via username to pull league rosters, standings, and draft history
- **CSV Import**: Re-import updated rankings from Google Sheets anytime
- **Auto-Save**: Draft state persists in localStorage between sessions

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages

1. Push to GitHub:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/draft-command.git
git push -u origin main
```

2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Create a project → Connect to Git → Select your repo
4. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Deploy

Your site will be live at `draft-command.pages.dev` (or a custom domain).

## Updating Rankings

Export your Google Sheet as CSV with columns: `Rank, Player, Pos, Team`

Then either:
- Use the **Import** tab in the app to upload the CSV
- Or update the data arrays in `src/App.jsx` directly
