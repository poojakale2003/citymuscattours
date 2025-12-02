<?php
require_once __DIR__ . '/config.php';

// Get route from query string
$route = $_GET['route'] ?? '';

// Remove leading/trailing slashes
$route = trim($route, '/');

// Default route
if (empty($route)) {
    $route = 'home';
}

// Route mapping
$routes = [
    'home' => 'home.php',
    'city-tours' => 'category.php',
    'car-rental' => 'category.php',
    'airport-transport' => 'category.php',
    'hotel-booking' => 'category.php',
    'packages' => 'packages.php',
    'blog' => 'blog.php',
    'about' => 'static.php',
    'contact' => 'static.php',
    'terms' => 'static.php',
    'privacy' => 'static.php',
    'cancellation-policy' => 'static.php',
    'booking' => 'booking.php',
    'checkout' => 'checkout.php',
    'search' => 'search.php',
    'wishlist' => 'wishlist.php',
    'admin' => 'admin/index.php',
    'admin/login' => 'admin/login.php',
    'admin/packages' => 'admin/packages.php',
    'admin/bookings' => 'admin/bookings.php',
    'admin/users' => 'admin/users.php',
    'admin/blogs' => 'admin/blogs.php',
    'admin/testimonials' => 'admin/testimonials.php',
    'admin/notifications' => 'admin/notifications.php',
];

// Handle dynamic routes (e.g., /city-tours/123, /packages/123)
if (preg_match('/^([^\/]+)\/([^\/]+)$/', $route, $matches)) {
    $category = $matches[1];
    $id = $matches[2];
    
    // Check if it's a category detail page
    $categories = ['city-tours', 'car-rental', 'airport-transport', 'hotel-booking'];
    if (in_array($category, $categories)) {
        $_GET['category'] = $category;
        $_GET['id'] = $id;
        $route = 'category-detail';
        $routes['category-detail'] = 'category-detail.php';
    } elseif ($category === 'packages') {
        $_GET['id'] = $id;
        $route = 'package-detail';
        $routes['package-detail'] = 'package-detail.php';
    } elseif ($category === 'blog') {
        $_GET['slug'] = $id;
        $route = 'blog-detail';
        $routes['blog-detail'] = 'blog-detail.php';
    }
}

// Handle admin dynamic routes
if (preg_match('/^admin\/([^\/]+)\/([^\/]+)$/', $route, $matches)) {
    $section = $matches[1];
    $action = $matches[2];
    
    if ($section === 'packages' && $action === 'new') {
        $route = 'admin/packages/new';
        $routes['admin/packages/new'] = 'admin/packages-new.php';
    } elseif ($section === 'packages' && is_numeric($action)) {
        $_GET['id'] = $action;
        $route = 'admin/packages/edit';
        $routes['admin/packages/edit'] = 'admin/packages-edit.php';
    } elseif ($section === 'bookings' && is_numeric($action)) {
        $_GET['id'] = $action;
        $route = 'admin/bookings/detail';
        $routes['admin/bookings/detail'] = 'admin/bookings-detail.php';
    }
}

// Get the file to include
$file = $routes[$route] ?? null;

if ($file && file_exists(VIEWS_PATH . '/' . $file)) {
    // Set route for use in views
    $currentRoute = $route;
    
    // Include the view file
    require_once VIEWS_PATH . '/' . $file;
} else {
    // 404 Not Found
    http_response_code(404);
    require_once VIEWS_PATH . '/404.php';
}

