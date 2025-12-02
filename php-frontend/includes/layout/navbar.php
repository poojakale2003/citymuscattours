<?php
$currentPath = $_SERVER['REQUEST_URI'];
$navLinks = [
    ['href' => baseUrl(), 'label' => 'Home'],
    ['href' => baseUrl('city-tours'), 'label' => 'Tour Packages'],
    ['href' => baseUrl('car-rental'), 'label' => 'Car Rental'],
    ['href' => baseUrl('airport-transport'), 'label' => 'Airport Transport'],
    ['href' => baseUrl('hotel-booking'), 'label' => 'Hotel Booking'],
];
?>
<header class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300" id="navbar">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex flex-1 items-center gap-4 lg:gap-8">
            <a href="<?= baseUrl() ?>" class="flex items-center gap-3 transition-opacity hover:opacity-80" aria-label="Home">
                <span class="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white">
                    <img src="<?= baseUrl('public/logo.jpg') ?>" alt="citymuscattours logo" class="h-full w-full object-cover" onerror="this.src='<?= baseUrl('public/assets/hero/main.jpeg') ?>'">
                    <span class="sr-only">citymuscattours</span>
                </span>
            </a>
            <div class="relative hidden w-full max-w-sm lg:flex">
                <form action="<?= baseUrl('search') ?>" method="GET" class="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                    <input
                        type="text"
                        name="q"
                        value="<?= e($_GET['q'] ?? '') ?>"
                        placeholder="Find places and things to do"
                        class="w-full border-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />
                    <button type="submit" class="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-700" aria-label="Search">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>

        <div class="hidden items-center gap-4 lg:flex">
            <nav class="flex items-center gap-1">
                <?php foreach ($navLinks as $link): 
                    $isActive = ($link['href'] === baseUrl() && $currentPath === baseUrl()) || 
                                 ($link['href'] !== baseUrl() && strpos($currentPath, $link['href']) !== false);
                ?>
                    <a 
                        href="<?= $link['href'] ?>" 
                        class="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 <?= $isActive ? 'bg-[var(--color-brand-600)] text-white shadow-md shadow-[var(--color-brand-600)]/20' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900' ?>"
                    >
                        <span><?= e($link['label']) ?></span>
                        <?php if ($isActive): ?>
                            <span class="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white/50"></span>
                        <?php endif; ?>
                    </a>
                <?php endforeach; ?>
            </nav>
            <a href="<?= baseUrl('booking') ?>" class="rounded-lg bg-[var(--color-brand-600)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--color-brand-600)]/25 transition-all duration-200 hover:bg-[var(--color-brand-700)] hover:shadow-lg hover:shadow-[var(--color-brand-600)]/30">
                Book Now
            </a>
        </div>

        <div class="flex items-center gap-2 lg:hidden">
            <button type="button" onclick="toggleMobileMenu()" class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50" aria-label="Toggle menu" id="mobile-menu-btn">
                <span class="sr-only">Open navigation</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 transition-transform duration-200" id="menu-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </div>

    <div class="hidden lg:hidden" id="mobile-menu">
        <div class="border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-lg">
            <nav class="flex flex-col gap-1.5">
                <?php foreach ($navLinks as $index => $link): 
                    $isActive = ($link['href'] === baseUrl() && $currentPath === baseUrl()) || 
                                 ($link['href'] !== baseUrl() && strpos($currentPath, $link['href']) !== false);
                ?>
                    <a
                        href="<?= $link['href'] ?>"
                        onclick="toggleMobileMenu()"
                        class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 <?= $isActive ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-sm' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900' ?>"
                    >
                        <span class="h-4 w-4"></span>
                        <span class="flex-1"><?= e($link['label']) ?></span>
                        <?php if ($isActive): ?>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4 text-[var(--color-brand-600)]">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        <?php endif; ?>
                    </a>
                <?php endforeach; ?>
            </nav>
            <div class="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-6">
                <a href="<?= baseUrl('booking') ?>" class="rounded-lg bg-[var(--color-brand-600)] px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-[var(--color-brand-600)]/25 transition-all duration-200 hover:bg-[var(--color-brand-700)] hover:shadow-lg">
                    Book Now
                </a>
            </div>
        </div>
    </div>
</header>

<script>
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    const icon = document.getElementById('menu-icon');
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />';
    } else {
        menu.classList.add('hidden');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />';
    }
}

// Handle scroll for navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('border-slate-200', 'bg-white/95', 'shadow-sm');
        navbar.classList.remove('border-slate-200/70', 'bg-white/90');
    } else {
        navbar.classList.remove('border-slate-200', 'bg-white/95', 'shadow-sm');
        navbar.classList.add('border-slate-200/70', 'bg-white/90');
    }
});
</script>

