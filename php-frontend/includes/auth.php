<?php
/**
 * Authentication helper functions
 */

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['access_token']) && !empty($_SESSION['access_token']);
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return isAuthenticated() && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        redirect(baseUrl('admin/login'));
    }
}

/**
 * Require admin
 */
function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        redirect(baseUrl('admin/login'));
    }
}

/**
 * Get current user
 */
function currentUser() {
    return $_SESSION['user'] ?? null;
}

/**
 * Login user
 */
function loginUser($token, $refreshToken, $user) {
    $_SESSION['access_token'] = $token;
    $_SESSION['refresh_token'] = $refreshToken;
    $_SESSION['user'] = $user;
    $_SESSION['user_role'] = $user['role'] ?? 'user';
}

/**
 * Logout user
 */
function logoutUser() {
    session_destroy();
    session_start();
}

