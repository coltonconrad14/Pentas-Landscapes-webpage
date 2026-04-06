# Pentas-Landscapes-webpage

## Render Launch Info

This project is a static website and can be deployed on Render as a Static Site.

### Service Setup (Render Dashboard)

- Service type: Static Site
- Repository: `coltonconrad14/Pentas-Landscapes-webpage`
- Branch: `main`
- Build command: leave blank (or use `echo "No build step"`)
- Publish directory: `.`
- Auto deploy: On

### Environment

No environment variables are required for this site.

### First Deploy Steps

1. Push your latest changes to `main`.
2. In Render, click New + and choose Static Site.
3. Connect the GitHub repo.
4. Enter the setup values listed above.
5. Click Create Static Site.

### Blueprint Deploy (Repo-Driven)

This repo includes a Render Blueprint config in `render.yaml`.

1. In Render, choose New + and select Blueprint.
2. Connect `coltonconrad14/Pentas-Landscapes-webpage`.
3. Render will read `render.yaml` and create the static service automatically.

### After Launch

- Render will provide a live URL like `https://<service-name>.onrender.com`.
- To use a custom domain, open your service settings in Render and add your domain under Custom Domains.
- Every push to `main` triggers a new deploy when Auto deploy is enabled.

## Build Commands

### Render Build Command

Use either of these in Render:

- Preferred: leave Build Command blank
- Optional explicit command: `echo "No build step required"`

### Local Preview Commands

Run from the project root:

```bash
# Python 3
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Production Smoke Check

Run this before every deploy:

```bash
bash scripts/smoke-check.sh
```

What it checks:

- Required static files exist
- Internal `#anchor` links match valid `id` targets
- Placeholder `href="#"` links are reported (informational)
- No `TODO` / `FIXME` / `XXX` markers in shipped HTML/CSS/JS

## Pre-Launch QA Matrix

### Functionality

- [ ] Header navigation links scroll to correct sections
- [ ] Mobile menu opens/closes and restores scroll position
- [ ] Class tabs switch content correctly (click + keyboard)
- [ ] Testimonial controls work (buttons, dots, swipe)
- [ ] Contact form validates required fields and shows success state

### Mobile Compatibility

- [ ] iPhone Safari: layout and spacing are clean, no horizontal overflow
- [ ] Android Chrome: touch targets are comfortable and responsive
- [ ] Drawer/menu respects safe-area insets on notched devices
- [ ] Back-to-top button stays visible and tappable above browser UI

### Accessibility

- [ ] Skip link is keyboard reachable and jumps to main content
- [ ] Focus ring is visible on links, buttons, and form controls
- [ ] Form errors are announced and `aria-invalid` updates correctly
- [ ] Reduced-motion preference disables non-essential movement

### Content & Placeholder Review

- [ ] Placeholder social links (`href="#"`) confirmed with client
- [ ] Privacy/Terms links replaced or approved as placeholders
- [ ] Phone, email, and service-area copy confirmed

### SEO & Metadata

- [ ] Page title and meta description are final
- [ ] Open Graph and Twitter tags are correct for launch
- [ ] Favicon and share image load correctly

### Deployment

- [ ] `bash scripts/smoke-check.sh` passes
- [ ] Live Render URL loads over HTTPS
- [ ] Hard refresh shows latest CSS/JS/logo assets