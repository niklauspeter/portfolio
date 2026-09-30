# Klaus Orioki — Portfolio

Personal portfolio of Klaus Orioki, full-stack software developer based in Nairobi, Kenya.
A static site (HTML, CSS and JavaScript) with no build step, ready for GitHub Pages.

## Structure

```
index.html              Page markup (includes the small inline icon set)
css/styles.css          All styles
js/main.js              All interactions
assets/
  profile.webp          Hero photo
  logos/                Tech stack logos (from devicon v2.17.0)
  projects/             Project screenshots (800×500 .webp)
```

## Run locally

Open `index.html` in a browser. Or, to test it the way GitHub Pages serves it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Push these files to the root of a repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.

## Common edits

| To change… | Edit |
|---|---|
| Text, links, projects | `index.html` |
| Add a project | Copy an `<article class="featured-card">` in `index.html`; set `data-category` (`websites` or `web-apps`) and `data-industry` (`ecommerce`, `tours`, `portfolio`, `wellness`, `finance`, `trucking`). Add its screenshot to `assets/projects/`. Counts and numbering update automatically. |
| Add a web-app video | Copy a video card and set `data-video` to the YouTube video ID. |
| Hero stats | `data-count` values in the hero section of `index.html` |
| Colours, spacing, fonts | `css/styles.css` (colour tokens are at the top) |
| Particle background | The `PARTICLES` settings block in `js/main.js` |
| Service pop-up text | The `<template id="service-…">` blocks in `index.html` |

## Contact form

The form posts to [FormSubmit](https://formsubmit.co) at `oriokiklaus@gmail.com`.
The first submission after going live triggers an activation email from FormSubmit. Confirm it once, and messages will arrive from then on.
