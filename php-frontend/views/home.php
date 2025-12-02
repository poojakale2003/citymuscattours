<?php
$pageTitle = 'Luxury tours, cars, and airport transfers across Oman';
$pageDescription = 'Discover curated tour packages, premium car rentals, and seamless airport transfers across Oman.';

include INCLUDES_PATH . '/layout/header.php';
?>

<main>
    <!-- Hero Section -->
    <section class="relative isolate overflow-hidden">
        <div class="relative h-[28rem] w-full sm:h-[32rem] md:h-[36rem] lg:h-[40rem] xl:h-[44rem]">
            <img src="<?= baseUrl('public/assets/hero/main.jpeg') ?>" alt="citymuscattours explorers" class="h-full w-full object-cover">
            <span class="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,38,0.4)_0%,rgba(11,20,38,0.75)_100%)]"></span>
        </div>

        <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-5 md:px-6 lg:px-8">
            <div class="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                <div class="space-y-3 sm:space-y-4 md:space-y-5">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/90 sm:text-sm md:text-base">
                        city muscat tours
                    </p>
                    <h1 class="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
                        Explore The World <span class="relative inline-block">
                            Around You
                            <span class="absolute -bottom-1.5 left-0 h-1.5 w-full rounded-full bg-white/90 sm:-bottom-2 sm:h-2"></span>
                        </span>
                    </h1>
                    <p class="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:text-xl">
                        Discover curated tour packages, premium car rentals, and seamless airport transfers. 
                        Your journey to unforgettable experiences starts here.
                    </p>
                </div>

                <div class="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                    <a href="<?= baseUrl('packages') ?>" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-brand-600)]/30 transition-all duration-200 hover:bg-[var(--color-brand-700)] hover:shadow-xl hover:shadow-[var(--color-brand-600)]/40 hover:-translate-y-0.5 sm:w-auto sm:px-6 sm:py-3.5">
                        Explore Packages
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>

                <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white sm:mt-8 sm:gap-4 sm:text-sm md:mt-10 md:gap-5 lg:gap-6">
                    <?php
                    $tabs = [
                        ['id' => 'city-tours', 'label' => 'Tour Packages', 'href' => baseUrl('city-tours')],
                        ['id' => 'car-rental', 'label' => 'Car Rental', 'href' => baseUrl('car-rental')],
                        ['id' => 'airport-transport', 'label' => 'Airport Transport', 'href' => baseUrl('airport-transport')],
                        ['id' => 'hotel-booking', 'label' => 'Hotel Booking', 'href' => baseUrl('hotel-booking')],
                    ];
                    foreach ($tabs as $tab):
                    ?>
                        <a href="<?= $tab['href'] ?>" class="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white sm:gap-2 sm:px-4 sm:py-2.5">
                            <span class="relative inline-block whitespace-nowrap">
                                <?= e($tab['label']) ?>
                                <span class="absolute -bottom-1 left-0 h-0.5 w-full bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-50"></span>
                            </span>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- Hero Services -->
    <section class="relative mx-auto max-w-7xl px-4 py-10 -mt-16 sm:-mt-20 lg:-mt-24 md:px-6 lg:px-8">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <?php
            $services = [
                [
                    'title' => 'Tour Packages',
                    'badge' => 'Curated Itineraries',
                    'description' => 'Private guides, cultural immersion, and hidden gems tailored to your pace.',
                    'cta' => 'Explore Tour Packages ',
                    'image' => baseUrl('public/assets/hero-services/1.webp'),
                    'href' => baseUrl('city-tours'),
                ],
                [
                    'title' => 'Car Rental',
                    'badge' => 'Luxury Fleet',
                    'description' => 'Executive sedans, chauffeur services, and premium amenities included.',
                    'cta' => 'Reserve a Car ',
                    'image' => baseUrl('public/assets/hero-services/2.jpeg'),
                    'href' => baseUrl('car-rental'),
                ],
                [
                    'title' => 'Airport Transport',
                    'badge' => 'Seamless Transfers',
                    'description' => 'Meet & greet hosts, flight monitoring, and VIP lounge access on arrival.',
                    'cta' => 'Book Airport Transfer ',
                    'image' => baseUrl('public/assets/hero-services/3.jpeg'),
                    'href' => baseUrl('airport-transport'),
                ],
                [
                    'title' => 'Hotel Booking',
                    'badge' => 'Premium Accommodations',
                    'description' => 'Luxury hotels and resorts with exclusive rates, concierge services, and flexible cancellation.',
                    'cta' => 'Book a Hotel ',
                    'image' => baseUrl('public/assets/hero-services/4.avif'),
                    'href' => baseUrl('hotel-booking'),
                ],
            ];
            foreach ($services as $service):
            ?>
                <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/60">
                    <div class="h-40 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('<?= $service['image'] ?>')"></div>
                    <div class="space-y-4 px-6 py-6">
                        <span class="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-brand-600)]">
                            <?= e($service['badge']) ?>
                        </span>
                        <h3 class="text-xl font-bold text-slate-900"><?= e($service['title']) ?></h3>
                        <p class="text-sm leading-relaxed text-slate-600"><?= e($service['description']) ?></p>
                        <a href="<?= $service['href'] ?>" class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-600)] transition-all duration-200 hover:gap-3 hover:text-[var(--color-brand-700)]">
                            <?= e($service['cta']) ?>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Attraction Showcase - Will be loaded via includes for better organization -->
    <?php include VIEWS_PATH . '/partials/attraction-showcase.php'; ?>

    <!-- Video Highlight -->
    <?php include VIEWS_PATH . '/partials/video-highlight.php'; ?>

    <!-- Testimonials Section -->
    <?php include VIEWS_PATH . '/partials/testimonials.php'; ?>

    <!-- Experience Services -->
    <?php include VIEWS_PATH . '/partials/experience-services.php'; ?>

    <!-- Blog and Stories -->
    <?php include VIEWS_PATH . '/partials/blog-stories.php'; ?>

    <!-- Newsletter CTA -->
    <?php include VIEWS_PATH . '/partials/newsletter-cta.php'; ?>
</main>

<?php include INCLUDES_PATH . '/layout/footer.php'; ?>
