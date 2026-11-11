# andreelias.dev

Portfolio site: a stylized 3D meadow (three.js) with the name, role, projects and contact links
laid over it. Next.js 13 (app directory), English only, served at `/en`.

```bash
npm run dev
```

## Where things are

| What | Where |
| --- | --- |
| Words (title, description, project tag lines and descriptions) | `dictionaries/en.json` |
| Links, project order and pictures, the hand-drawn name frames | `components/portfolio/content.ts` |
| Page markup (rendered on the server, so crawlers see all of it) | `components/portfolio/overlay.tsx` |
| Hand-drawn name, project card, taps, entrance | `components/portfolio/overlay-controller.js` |
| Layout for desktop and phones | `app/[lang]/meadow.css` |
| Title, description, social cards | `app/[lang]/head.tsx` |
| Structured data, font loading | `components/portfolio/boot.tsx` |
| Redirects (`/` and `/pt` to `/en`) | `middleware.ts` (`/discord` is in `next.config.js`) |
| The 3D scene | `meadow/` |

`meadow/config.js` and everything under `meadow/core/` and `meadow/world/` are copied unchanged
from the stylized-meadow project; update the scene by copying them again. `meadow/start.js` is the
only file that connects the scene to this page.

## Notes

- In this Next.js version, `head.tsx` may only contain `<title>`, `<meta>` and plain `<link>`
  tags. Stylesheets, `<style>`, preconnects or scripts there fail to hydrate and blank the page.
- URL options for checking a device: `?fps` shows frame rate and render size, `?q=phone` forces
  the phone graphics, `?scene=0` skips the 3D scene.
- After deploying, submit `https://www.andreelias.dev/sitemap.xml` in Google Search Console.
