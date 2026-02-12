# Simple CV Website Template

A clean, responsive CV/resume website template that works well on all devices. Free to use and modify.

## Features

- Responsive design
- Dark mode support
- Clean, minimal styling
- Print-friendly

## How to Use

1. Clone or download this repository
2. Edit the `index.html` file with your information
3. Replace images in the `assets` folder with your own
4. Customize colors in `css/styles.css` if desired

## Local Development

If you want to run this locally with auto-refresh:

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Then open http://localhost:3000 in your browser.

## CV PDF Export

Generate the single-page CV PDF from `single-page-cv/index.html`:

```bash
bun run cv:pdf
```

Enable the versioned git hook once per local clone:

```bash
git config core.hooksPath .githooks
```

If Chromium is not installed for Playwright yet, run once:

```bash
bunx playwright install chromium
```

After this, commits that include `single-page-cv/index.html` will automatically regenerate and stage:

`assets/Thorben_Woelk_CV_2026.pdf`

## Deployment

This template works with GitHub Pages and other static hosting services:

1. For GitHub Pages, push to your username.github.io repository
2. For other services, upload all files to your hosting provider

## License

Free to use for personal and commercial projects. Attribution appreciated but not required.

## Credits

Created by Thorben Woelk
