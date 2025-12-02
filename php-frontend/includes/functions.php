<?php
/**
 * Helper functions
 */

/**
 * Escape HTML output
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Format currency
 */
function formatCurrency($amount, $currency = 'INR') {
    $symbols = [
        'INR' => '₹',
        'USD' => '$',
        'EUR' => '€',
        'OMR' => 'ر.ع.',
    ];
    
    $symbol = $symbols[$currency] ?? $currency;
    return $symbol . number_format($amount, 0);
}

/**
 * Get current URL
 */
function currentUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    return $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
}

/**
 * Get base URL
 */
function baseUrl($path = '') {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    
    // Get the base path from the current script location
    $scriptPath = dirname($_SERVER['SCRIPT_NAME']);
    $base = rtrim($scriptPath, '/');
    
    // If we're in php-frontend directory, use that
    if (strpos($base, '/php-frontend') !== false) {
        $base = '/frontend/php-frontend';
    } else {
        $base = '/frontend/php-frontend';
    }
    
    return $protocol . $host . $base . ($path ? '/' . ltrim($path, '/') : '');
}

/**
 * Redirect to URL
 */
function redirect($url) {
    header('Location: ' . $url);
    exit;
}

/**
 * Get route parameter
 */
function routeParam($key, $default = null) {
    return $_GET[$key] ?? $default;
}

/**
 * Check if route matches
 */
function isRoute($route) {
    global $currentRoute;
    return $currentRoute === $route;
}

/**
 * Get category display name
 */
function getCategoryDisplayName($slug) {
    $map = [
        'city-tours' => 'Tour Packages',
        'car-rental' => 'Car Rental',
        'airport-transport' => 'Airport Transport',
        'hotel-booking' => 'Hotel Booking',
        'cruises-stays' => 'Cruises & Stays',
        'experiences' => 'Experiences',
    ];
    return $map[$slug] ?? ucfirst(str_replace('-', ' ', $slug));
}

/**
 * Format date
 */
function formatDate($date, $format = 'Y-m-d') {
    if (empty($date)) return '';
    try {
        $dt = new DateTime($date);
        return $dt->format($format);
    } catch (Exception $e) {
        return '';
    }
}

/**
 * Truncate text
 */
function truncate($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    return substr($text, 0, $length) . $suffix;
}

/**
 * Generate CSRF token
 */
function csrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

