<?php
// Newsletter CTA Section
$submitted = isset($_SESSION['newsletter_submitted']) && $_SESSION['newsletter_submitted'];
$error = $_SESSION['newsletter_error'] ?? null;
unset($_SESSION['newsletter_submitted'], $_SESSION['newsletter_error']);
?>
<section class="relative overflow-hidden py-20 text-white sm:py-24 lg:py-28">
    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop" alt="citymuscattours mountains" class="absolute inset-0 h-full w-full object-cover">
    <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,29,55,0.85),rgba(28,64,128,0.7))]"></div>
    <div class="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 text-center sm:px-8 md:px-12">
        <div class="space-y-4">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-white/90">
                Stay Connected
            </p>
            <h2 class="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Subscribe &amp; Get Special Discount with citymuscattours
            </h2>
            <p class="mx-auto max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                Receive curated offers, destination inspiration, and concierge-only perks delivered to your inbox.
            </p>
        </div>
        <?php if ($submitted): ?>
            <div class="mx-auto w-full max-w-xl rounded-lg bg-green-500/20 border border-green-400/50 px-5 py-3.5 text-sm text-white backdrop-blur-sm md:px-6 md:py-4 md:text-base">
                Thank you for subscribing! Check your inbox for a welcome email.
            </div>
        <?php else: ?>
            <form action="<?= baseUrl('newsletter/subscribe') ?>" method="POST" class="mx-auto flex w-full max-w-xl flex-col gap-3 md:flex-row md:items-center">
                <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    required
                    class="w-full rounded-lg border-2 border-white/40 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/70 backdrop-blur-sm transition-all duration-200 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 md:py-4 md:text-base"
                />
                <button
                    type="submit"
                    class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-brand-600)]/30 transition-all duration-200 hover:bg-[var(--color-brand-700)] hover:shadow-xl hover:shadow-[var(--color-brand-600)]/40 hover:-translate-y-0.5 md:w-auto md:px-8 md:py-4 md:text-base"
                >
                    Subscribe
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                </button>
            </form>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="mx-auto w-full max-w-xl rounded-lg bg-red-500/20 border border-red-400/50 px-5 py-3.5 text-sm text-white backdrop-blur-sm md:px-6 md:py-4 md:text-base">
                <?= e($error) ?>
            </div>
        <?php endif; ?>
    </div>
</section>

