<?php
// Redirect if already logged in
if (isAuthenticated()) {
    redirect(baseUrl('admin'));
}

$pageTitle = 'Admin Login';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        $error = 'Invalid security token. Please try again.';
    } else {
        try {
            // Call login API
            $url = API_BASE_URL . '/auth/login';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'email' => $email,
                'password' => $password
            ]));
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $data = json_decode($response, true);
                
                // Save tokens and user data
                $accessToken = $data['tokens']['accessToken'] ?? $data['accessToken'] ?? $data['token'] ?? null;
                $refreshToken = $data['tokens']['refreshToken'] ?? $data['refreshToken'] ?? null;
                $user = $data['user'] ?? [];
                
                if ($accessToken) {
                    loginUser($accessToken, $refreshToken, $user);
                    redirect(baseUrl('admin'));
                } else {
                    $error = 'Invalid response from server.';
                }
            } else {
                $errorData = json_decode($response, true);
                $error = $errorData['message'] ?? 'Invalid email or password.';
            }
        } catch (Exception $e) {
            $error = 'Login failed: ' . $e->getMessage();
        }
    }
}

include INCLUDES_PATH . '/layout/header.php';
?>

<main class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
                <p class="text-slate-600">Sign in to access the admin panel</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <?= e($error) ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="<?= baseUrl('admin/login') ?>">
                <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                
                <div class="mb-6">
                    <label for="email" class="block text-sm font-semibold text-slate-900 mb-2">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        class="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-[var(--color-brand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                        placeholder="admin@example.com"
                    >
                </div>
                
                <div class="mb-6">
                    <label for="password" class="block text-sm font-semibold text-slate-900 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        class="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-[var(--color-brand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                        placeholder="••••••••"
                    >
                </div>
                
                <button 
                    type="submit" 
                    class="w-full rounded-lg bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[var(--color-brand-700)] transition"
                >
                    Sign In
                </button>
            </form>
        </div>
    </div>
</main>

<?php include INCLUDES_PATH . '/layout/footer.php'; ?>

