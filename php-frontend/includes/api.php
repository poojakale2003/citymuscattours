<?php
/**
 * API Client for PHP
 * Mirrors the functionality of src/lib/api.ts
 */

class ApiClient {
    private $baseUrl;
    private $token;
    private $refreshToken;
    
    public function __construct() {
        $this->baseUrl = API_BASE_URL;
        $this->loadTokens();
    }
    
    /**
     * Load tokens from session
     */
    private function loadTokens() {
        $this->token = $_SESSION['access_token'] ?? null;
        $this->refreshToken = $_SESSION['refresh_token'] ?? null;
    }
    
    /**
     * Save tokens to session
     */
    private function saveTokens($accessToken, $refreshToken = null) {
        $_SESSION['access_token'] = $accessToken;
        if ($refreshToken) {
            $_SESSION['refresh_token'] = $refreshToken;
        }
        $this->token = $accessToken;
        if ($refreshToken) {
            $this->refreshToken = $refreshToken;
        }
    }
    
    /**
     * Clear tokens
     */
    public function clearTokens() {
        unset($_SESSION['access_token']);
        unset($_SESSION['refresh_token']);
        $this->token = null;
        $this->refreshToken = null;
    }
    
    /**
     * Make API request
     */
    private function request($endpoint, $options = []) {
        $url = $this->baseUrl . $endpoint;
        $method = $options['method'] ?? 'GET';
        $headers = $options['headers'] ?? [];
        $body = $options['body'] ?? null;
        
        // Add authorization header if token exists
        if ($this->token) {
            $headers['Authorization'] = 'Bearer ' . $this->token;
        }
        
        // Default headers
        if (!isset($headers['Content-Type']) && !($body instanceof \CURLFile)) {
            $headers['Content-Type'] = 'application/json';
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->buildHeaders($headers));
        
        if ($body) {
            if (is_array($body) && !($body instanceof \CURLFile)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            } else {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            }
        }
        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('API request failed: ' . $error);
        }
        
        $data = json_decode($response, true);
        
        // Handle 401 - try to refresh token
        if ($httpCode === 401 && $this->refreshToken) {
            if ($this->refreshAccessToken()) {
                // Retry request with new token
                return $this->request($endpoint, $options);
            }
        }
        
        if ($httpCode >= 400) {
            $errorMessage = $data['message'] ?? 'API request failed';
            if (isset($data['errors'])) {
                $errorMessage .= ': ' . json_encode($data['errors']);
            }
            throw new Exception($errorMessage, $httpCode);
        }
        
        return $data;
    }
    
    /**
     * Build headers array for cURL
     */
    private function buildHeaders($headers) {
        $result = [];
        foreach ($headers as $key => $value) {
            $result[] = $key . ': ' . $value;
        }
        return $result;
    }
    
    /**
     * Refresh access token
     */
    private function refreshAccessToken() {
        if (!$this->refreshToken) {
            return false;
        }
        
        try {
            $url = $this->baseUrl . '/auth/refresh';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'refreshToken' => $this->refreshToken
            ]));
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $data = json_decode($response, true);
                if (isset($data['tokens']['accessToken'])) {
                    $this->saveTokens($data['tokens']['accessToken'], $data['tokens']['refreshToken'] ?? null);
                    return true;
                } elseif (isset($data['accessToken'])) {
                    $this->saveTokens($data['accessToken'], $data['refreshToken'] ?? null);
                    return true;
                }
            }
        } catch (Exception $e) {
            // Refresh failed
        }
        
        return false;
    }
    
    // API Methods (mirroring src/lib/api.ts)
    
    public function getPackages($params = []) {
        $query = http_build_query($params);
        return $this->request('/packages' . ($query ? '?' . $query : ''));
    }
    
    public function getPackage($id) {
        return $this->request('/packages/' . $id);
    }
    
    public function createPackage($data) {
        return $this->request('/packages', [
            'method' => 'POST',
            'body' => $data
        ]);
    }
    
    public function updatePackage($id, $data) {
        return $this->request('/packages/' . $id, [
            'method' => 'PUT',
            'body' => $data
        ]);
    }
    
    public function deletePackage($id) {
        return $this->request('/packages/' . $id, [
            'method' => 'DELETE'
        ]);
    }
    
    public function archivePackage($id) {
        return $this->request('/packages/' . $id . '/archive', [
            'method' => 'POST'
        ]);
    }
    
    public function unarchivePackage($id) {
        return $this->request('/packages/' . $id . '/unarchive', [
            'method' => 'POST'
        ]);
    }
    
    public function getBookings($params = []) {
        $query = http_build_query($params);
        return $this->request('/bookings' . ($query ? '?' . $query : ''));
    }
    
    public function getBooking($id) {
        return $this->request('/bookings/' . $id);
    }
    
    public function createBooking($data) {
        return $this->request('/bookings', [
            'method' => 'POST',
            'body' => $data
        ]);
    }
    
    public function getUsers($params = []) {
        $query = http_build_query($params);
        return $this->request('/users' . ($query ? '?' . $query : ''));
    }
    
    public function subscribeNewsletter($email, $source = 'website') {
        return $this->request('/newsletter/subscribe', [
            'method' => 'POST',
            'body' => [
                'email' => $email,
                'source' => $source
            ]
        ]);
    }
    
    public function sendWelcomeEmail($email, $name = null) {
        return $this->request('/emails/send-welcome', [
            'method' => 'POST',
            'body' => [
                'recipientEmail' => $email,
                'recipientName' => $name
            ]
        ]);
    }
    
    public function getTestimonials($params = []) {
        $query = http_build_query($params);
        return $this->request('/testimonials' . ($query ? '?' . $query : ''));
    }
    
    public function getBlogs($params = []) {
        $query = http_build_query($params);
        return $this->request('/blogs' . ($query ? '?' . $query : ''));
    }
}

// Global API instance
$api = new ApiClient();

