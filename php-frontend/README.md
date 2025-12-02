# PHP Frontend - City Muscat Tours

This is a PHP version of the Next.js frontend, using the same backend API.

## Setup Instructions

1. **Copy to WAMP www directory**
   ```bash
   Copy the php-frontend folder to C:\wamp64\www\php-frontend
   ```

2. **Copy public assets**
   ```bash
   Copy the public folder from the Next.js frontend to php-frontend/public
   ```

3. **Configure API URL**
   Edit `config.php` and set the `API_BASE_URL`:
   ```php
   define('API_BASE_URL', 'http://localhost/php-backend/api');
   ```

4. **Set up Apache mod_rewrite**
   - Ensure mod_rewrite is enabled in Apache
   - The `.htaccess` file handles URL routing

5. **Access the site**
   ```
   http://localhost/php-frontend/
   ```

## Structure

```
php-frontend/
├── config.php              # Configuration
├── index.php               # Router
├── .htaccess               # URL rewriting
├── includes/
│   ├── api.php            # API client (mirrors src/lib/api.ts)
│   ├── auth.php           # Authentication helpers
│   ├── functions.php      # Utility functions
│   └── layout/
│       ├── header.php     # HTML header
│       ├── footer-content.php  # Footer
│       └── navbar.php     # Navigation bar
└── views/
    ├── home.php           # Home page
    ├── category.php       # Category listing pages
    ├── category-detail.php # Category detail pages
    ├── packages.php       # All packages page
    ├── package-detail.php # Package detail page
    ├── blog.php           # Blog listing
    ├── blog-detail.php     # Blog post detail
    ├── booking.php         # Booking page
    ├── checkout.php        # Checkout page
    ├── search.php          # Search results
    ├── static.php          # Static pages (about, contact, etc.)
    └── admin/              # Admin pages
        ├── index.php       # Admin dashboard
        ├── login.php       # Admin login
        ├── packages.php    # Package management
        └── ...
```

## Features

- ✅ Same backend API integration
- ✅ Same UI/UX with Tailwind CSS
- ✅ Server-side rendering with PHP
- ✅ Session-based authentication
- ✅ URL routing with .htaccess
- ✅ CSRF protection
- ✅ Responsive design

## API Integration

The `includes/api.php` file provides an `ApiClient` class that mirrors the functionality of `src/lib/api.ts`:

- Token management (access & refresh tokens)
- Automatic token refresh on 401 errors
- All API endpoints (packages, bookings, users, etc.)

## Authentication

- Uses PHP sessions for token storage
- Admin routes protected with `requireAdmin()`
- Login/logout functionality in `includes/auth.php`

## Notes

- This PHP version maintains the same functionality as the Next.js frontend
- Uses the same backend API endpoints
- Same styling with Tailwind CSS CDN
- All routes are handled through `index.php` router

