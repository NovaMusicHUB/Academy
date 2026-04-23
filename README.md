# Nova Music Academy — Website

Site premium pentru o academie privată de muzică din București.

---

## Structura proiectului

```
Academy/
├── README.md
├── .gitignore
├── accese.md              ← PRIVAT, nu se urcă pe GitHub
├── design/
│   └── DESIGN_STRATEGY.md ← Strategie completă UX/UI/Brand
└── src/
    ├── index.html
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── main.js
    └── assets/
        ├── images/        ← Poze, poster hero, og-image
        ├── video/         ← hero-academy.mp4 / .webm
        └── logos/         ← Logo-uri parteneri (SVG)
```

---

## Server (DigitalOcean Droplet)

| | |
|---|---|
| **IP** | `174.138.1.241` |
| **Folder site** | `/var/www/academy/src/` |
| **Nginx config** | `/etc/nginx/sites-available/academy` |
| **URL** | `http://academy.novamusic.ro` (necesită DNS) |

### Conectare SSH la droplet

```bash
ssh -i /Users/mihailtirica/Site-uri/ssh/do_droplet root@174.138.1.241
```

### Deploy (upload fișiere modificate)

```bash
rsync -avz -e "ssh -i /Users/mihailtirica/Site-uri/ssh/do_droplet" \
  /Users/mihailtirica/Site-uri/Academy/src/ \
  root@174.138.1.241:/var/www/academy/src/
```

### DNS — adaugă în panoul de la registrar

```
Tip: A
Nume: academy
Valoare: 174.138.1.241
TTL: 3600
```

---

## Design System

Documentat complet în `design/DESIGN_STRATEGY.md`.

### Paleta de culori

| Rol | Nume | HEX |
|---|---|---|
| Background | Warm Ivory | `#FDFBF7` |
| CTA Primar | Terra Cotta Coral | `#E07A5F` |
| Accent Secundar | Golden Amber | `#F2C94C` |
| Tipografie | Deep Midnight Plum | `#1A1A2E` |
| Card Surface | Blush Petal | `#FDF0EC` |

### Fonturi (Google Fonts)

| Rol | Font | Folosit pentru |
|---|---|---|
| Serif | Playfair Display 700/900 | H1, H2, H3 |
| Handwriting | Caveat 400/700 | Pre-header, tagline-uri |
| Sans-serif | DM Sans 300–600 | Body, navigație, butoane |

---

## Pagini planificate

```
/                        ← Homepage (gata)
/cursuri/
  /cursuri/pian/
  /cursuri/chitara/
  /cursuri/voce/
  /cursuri/vioara/
  /cursuri/productie/
  /cursuri/teoria-muzicii/
/profesori/
  /profesori/[slug]/
/evaluare-gratuita/      ← Landing page principal de conversie
/despre-noi/
/testimoniale/
/blog/
/contact/
/multumim/               ← Thank-you page după rezervare
```

---

## Componente implementate în `index.html`

- **Hero section** — video background lazy-loaded, overlay, intent selector
- **Intent Selector** — filtrează cursurile după Copii / Adulți / Online
- **Logo Wall** — scroll infinit CSS, parteneri și acreditări
- **Instruments Grid** — 6 cursuri, filtrate dinamic prin JS
- **Features Block** — 6 avantaje competitive
- **Teacher Spotlight** — card profesor cu rating
- **Testimonials** — cu tab filter Părinți / Adulți / Toți
- **Booking Form** — 3 câmpuri, fallback WhatsApp dacă API-ul lipsește
- **Floating CTA** — apare la 30% scroll, dispare când form-ul e vizibil
- **Footer** — 4 coloane, social links, legal

---

## JavaScript (`src/js/main.js`)

| Modul | Funcționalitate |
|---|---|
| Header scroll | Navbar devine opac + shadow după 60px scroll |
| Mobile menu | Burger menu cu animație, close pe Escape |
| Lazy video | Video hero se încarcă doar când e vizibil (IntersectionObserver) |
| Intent selector | Filtrează cursurile + actualizează URL `?who=` |
| Testimonial tabs | Filtrare cu ARIA roles |
| Floating CTA | Apare la 30% scroll, dismiss per sesiune |
| Booking form | Submit async, fallback WhatsApp |
| Smooth scroll | Toate link-urile anchor `#` |

---

## Accesibilitate

- WCAG 2.2 AA/AAA — contrast ratio 15.8:1 pe text principal
- `prefers-reduced-motion` — dezactivează animații și video
- `aria-label`, `role`, `aria-pressed`, `aria-expanded` pe toate elementele interactive
- Focus visible customizat (outline terra cotta)
- Poster image pentru video (LCP optimizat)

---

## Ce mai trebuie făcut

- [ ] Adăugat DNS subdomain `academy.novamusic.ro`
- [ ] Activat HTTPS cu Certbot: `certbot --nginx -d academy.novamusic.ro`
- [ ] Înlocuit imaginile placeholder din `assets/images/`
- [ ] Adăugat video hero în `assets/video/` (MP4 + WebM, max 8MB)
- [ ] Adăugat logo-urile partenerilor în `assets/logos/` (format SVG)
- [ ] Creat paginile individuale (cursuri, profesori, evaluare gratuită)
- [ ] Conectat formularul de rezervare la un backend sau serviciu (Formspree, Make, n8n)
- [ ] Configurat Google Analytics / Meta Pixel
- [ ] Creat pagina `/multumim/` (thank-you după rezervare)

---

## HTTPS (după configurare DNS)

```bash
# Conectare la droplet
ssh -i /Users/mihailtirica/Site-uri/ssh/do_droplet root@174.138.1.241

# Instalare certificat SSL gratuit
certbot --nginx -d academy.novamusic.ro
```

---

*Ultima actualizare: Martie 2026*
