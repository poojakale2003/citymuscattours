This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js installed
- Backend server running on port 5000

### Backend Connection

The frontend is configured to connect to a backend API running on `http://localhost:5000/api`.

**To configure the backend URL:**

1. Create a `.env.local` file in the root directory:
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

2. If you need to use a different backend URL, update the `NEXT_PUBLIC_API_URL` value in `.env.local`

**Note:** The default API URL is already set to `http://localhost:5000/api` in `src/lib/api.ts`, so if you don't create `.env.local`, it will still work. However, using `.env.local` is recommended for environment-specific configurations.

**Important:** Make sure your backend server:
- Is running on port 5000
- Has CORS enabled to allow requests from `http://localhost:3000`
- Has API routes under the `/api` path (e.g., `/api/packages`, `/api/auth/login`, etc.)

### Running the Development Server

First, make sure your backend is running on port 5000, then start the frontend:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Building Static Website for Testing

This website is configured as a **static website** that can be opened directly in a browser or served from any web server.

### Build the Static Website

To create a static export of the website:

```bash
npm run build
```

This will create a static website in the `out` folder with all HTML, CSS, and JavaScript files ready to deploy.

### Testing the Static Website

You can test the static website in several ways:

#### Option 1: Open Directly in Browser (Easiest) ⭐

Simply **double-click** on `out/index.html` to open it directly in your browser!

Or:
1. Navigate to the `out` folder
2. Find `index.html`
3. Right-click → Open with → Your browser (Chrome, Firefox, Edge, etc.)

**✅ All styling and assets will load correctly!** The build process automatically fixes all paths to work with direct file opening.

**Note:** The website uses client-side routing, so make sure to:
- Always start from `index.html` (the homepage)
- Use the navigation links in the website (don't manually type URLs in the address bar)
- All internal links will work correctly when clicked

#### Option 2: Using a Simple HTTP Server (Alternative)

If you prefer using a local server:

**Using Python:**
```bash
cd out
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

**Using Node.js (npx):**
```bash
cd out
npx serve
```

**Using PHP:**
```bash
cd out
php -S localhost:8000
```

## Sharing the Website for Testing

Since this is a **static website**, you only need to share the `out` folder!

### What to Share

Simply share the **`out` folder** - that's it! This folder contains:
- All HTML pages
- All CSS and JavaScript files
- All images and assets
- Everything needed to view the website

### How Recipients Can Test

The recipient can test in two simple ways:

#### Method 1: Open Directly (Easiest) ⭐

1. **Extract the `out` folder** to their computer
2. **Navigate to the `out` folder**
3. **Double-click `index.html`** to open it in their browser
4. **Use the website navigation** - all links will work correctly!

That's it! No commands needed, no server setup required.

#### Method 2: Using a Local Server (Optional)

If they prefer using a server:

1. **Extract the `out` folder** to their computer
2. **Open terminal/command prompt** in the `out` folder
3. **Run one of these commands:**
   - **Python:** `python -m http.server 8000`
   - **Node.js:** `npx serve`
   - **PHP:** `php -S localhost:8000`
4. **Open browser** to `http://localhost:8000`

### Alternative: Deploy to Web Hosting

The `out` folder can also be uploaded to:
- **GitHub Pages**
- **Netlify** (drag and drop the `out` folder)
- **Vercel** (connect the repo)
- **Any static web hosting service**
- **Any web server** (Apache, Nginx, etc.)

Just upload the contents of the `out` folder to the web root directory.

### Important Notes

- The `out` folder is **completely self-contained** - no Node.js or build tools needed
- All pages are pre-rendered as static HTML
- The website works offline (once loaded)
- No server-side code is required

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
