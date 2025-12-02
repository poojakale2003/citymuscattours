<?php
// Configuration file for PHP frontend

// API Configuration
define('API_BASE_URL', getenv('API_BASE_URL') ?: 'http://localhost/php-backend/api');

// Site Configuration
define('SITE_URL', 'http://localhost/frontend/php-frontend');
define('SITE_NAME', 'City Muscat Tours');

// Paths
define('BASE_PATH', __DIR__);
define('PUBLIC_PATH', BASE_PATH . '/public');
define('VIEWS_PATH', BASE_PATH . '/views');
define('INCLUDES_PATH', BASE_PATH . '/includes');

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Muscat');

// Autoload helper functions
require_once INCLUDES_PATH . '/functions.php';
require_once INCLUDES_PATH . '/api.php';
require_once INCLUDES_PATH . '/auth.php';

