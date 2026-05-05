# Selbstvorstellung Thorben

Edit the deck sources here:

- `src/slides/` contains one HTML file per slide.
- `assets/styles.css` contains shared styling.
- `assets/role-carousel.js` contains the role carousel behavior.

Build the runnable deck:

```sh
node selbstvorstellung-readable/build.mjs
```

Open `index.html` in the browser after building.

The original bundled file can be re-extracted with:

```sh
node scripts/extract-readable-deck.mjs "Selbstvorstellung Thorben.html" "selbstvorstellung-readable"
```

That command overwrites the readable folder. Use it only when you want to start again from the bundle.
