# MatchIQ Pro — Final Project

**Course:** Web Technologies  
**Topic:** Football analytics dashboard (continuation of the same Midterm and Endterm project).  
**Group members:** **Batyrbek Isabek, Konakbay Yerassyl**.  
**Published website:** **https://isabek27.github.io/final-web/**.  
**Source repository:** **https://github.com/Isabek27/final-web**.

MatchIQ Pro is a six-page responsive football analytics demo site. It uses HTML, CSS, Bootstrap, JavaScript, DOM, jQuery, a public football API, OOP and `localStorage`.

## Start the website

1. Extract the ZIP and keep the folder structure.
2. Open the folder in VS Code and launch `index.html` using **Live Server**.
3. Navigate through all six pages using the sidebar.
4. You need an internet connection for Bootstrap/Font Awesome and the real football API. jQuery is bundled locally.

## Pages

| File | Content |
| --- | --- |
| `index.html` | Dashboard, old sample chart, dynamic player dashboard |
| `match.html` | Demo match cards, favorites, filters, real Bundesliga API |
| `standings.html` | Two demo league tables and team search |
| `players.html` | Demo player cards, class-based comparison, CRUD for saved players |
| `ai.html` | Sample prediction probabilities (not a real AI model) |
| `contact.html` | Demo contact form with validation and jQuery hints |

## New final-stage features

1. **External API:** `js/football-api.js` calls **OpenLigaDB**, displays nearby Bundesliga matches using `fetch` and `async/await`, and handles loading, success, empty-data and error states. Endpoint: `https://api.openligadb.de/getmatchdata/bl1/2026`. No API key is used; results depend on the remote service.
2. **Object-oriented programming:** `FootballPlayer` in `js/players.js` has a constructor, five properties, and methods `contributions()` and `goalDifference()`. Multiple objects are used for player comparisons.
3. **Persistent browser storage:** Custom player records are stored under `matchiq_custom_players` as JSON; they reappear after reload, can be edited/deleted, and invalid stored entries are ignored safely. Existing favorites/theme storage is preserved.
4. **CRUD:** Add, display, edit, and delete custom players on `players.html`.
5. **Dynamic data visualisation:** `js/dashboard.js` calculates totals and redraws a bar chart using demo and custom players, with source/metric controls.

## Endterm features preserved

- Search, demo match filters and favorites.
- Player sorting, league switcher and original sample chart.
- Theme switcher saved in the browser.
- Form validation and jQuery slide/fade effects.
- All six responsive pages and navigation.

**Note:** All old team/player numbers, predictions, and league standings are illustrative. Only the OpenLigaDB section fetches remote football data. The contact form does not actually send messages. Saved players exist only in the browser that created them.

## Structure

```text
MatchIQ_Pro_Final/
  index.html, match.html, standings.html
  players.html, ai.html, contact.html
  css/style.css
  js/main.js
  js/football-api.js
  js/players.js
  js/dashboard.js
  js/jquery-features.js
  js/jquery.min.js
  img/*.svg
  README.md
```

## Verification before submission

- Open every sidebar link and check desktop/mobile layout.
- Filter demo matches and save a favorite; reload to verify.
- Load and refresh API matches; also test without internet.
- Compare two players; create, edit, reload and delete a custom player.
- Open the Dashboard, switch to My Players, and change the chart metric.
- Test contact validation, jQuery explanations, light/dark mode and browser Console.
- Publish the same repository to GitHub Pages or Netlify; check all relative paths.

## Group contribution and defense

**Replace with actual names and contributions before submission.** Both group members need to demonstrate **all** functions and explain HTML, CSS, Bootstrap, JavaScript, DOM, validation, jQuery, OOP, API and localStorage. Each person should be ready to change/debug a piece of the code.
