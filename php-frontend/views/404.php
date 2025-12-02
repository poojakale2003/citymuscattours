<?php
http_response_code(404);
$pageTitle = '404 - Page Not Found';
include INCLUDES_PATH . '/layout/header.php';
?>

<main class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
        <h1 class="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p class="text-xl text-slate-600 mb-8">Page not found</p>
        <a href="<?= baseUrl() ?>" class="inline-block rounded-lg bg-[var(--color-brand-600)] px-8 py-3 text-lg font-semibold text-white hover:bg-[var(--color-brand-700)] transition">
            Go Home
        </a>
    </div>
</main>

<?php include INCLUDES_PATH . '/layout/footer.php'; ?>

