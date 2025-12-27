# Cloudflare Pages Setup (Using pages.dev)

## Current Implementation

The app now detects subdomains and loads the appropriate country data. Works with:

- URL parameters: `?data=nepal-government` (for development)
- Subdomains: `nepal.visualize-gov.pages.dev` (for production)

## Setup for Cloudflare Pages

Since you don't have a custom domain yet, here's how to set it up with `pages.dev`:

### Step 1: Deploy to Cloudflare Pages

Your main deployment will be at:
```
https://visualize-gov.pages.dev
```

### Step 2: Add Custom pages.dev Domains

Unfortunately, Cloudflare doesn't allow wildcard subdomains on `*.pages.dev`. However, you can create **branch preview URLs** for each country:

1. Create git branches for each country:
   ```bash
   git checkout -b nepal
   git checkout -b usa
   git checkout -b uk
   git checkout -b india
   git checkout -b china
   ```

2. Cloudflare Pages will automatically create preview URLs:
   - `nepal.visualize-gov.pages.dev` (from `nepal` branch)
   - `usa.visualize-gov.pages.dev` (from `usa` branch)
   - `uk.visualize-gov.pages.dev` (from `uk` branch)
   - `india.visualize-gov.pages.dev` (from `india` branch)
   - `china.visualize-gov.pages.dev` (from `china` branch)

### Step 3: Alternative - Use Query Parameters

The simpler approach is to use query parameters until you get a custom domain:

- Nepal: `https://visualize-gov.pages.dev/?data=nepal-government`
- USA: `https://visualize-gov.pages.dev/?data=usa-government`
- UK: `https://visualize-gov.pages.dev/?data=uk-government`
- India: `https://visualize-gov.pages.dev/?data=india-government`
- China: `https://visualize-gov.pages.dev/?data=china-government`

The country selector will navigate to the appropriate URL when clicked.

## For Local Development

```bash
npm run dev

# Access different countries:
http://localhost:5173/?data=nepal-government
http://localhost:5173/?data=usa-government
# etc.
```

## Future: When You Get a Custom Domain

Once you have a custom domain (e.g., `yourdomain.com`):

1. Add it to Cloudflare Pages
2. Add wildcard DNS: `*.yourdomain.com`
3. Subdomains will work automatically:
   - `nepal.yourdomain.com`
   - `usa.yourdomain.com`
   - etc.
