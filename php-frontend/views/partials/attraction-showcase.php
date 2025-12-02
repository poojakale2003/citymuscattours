<?php
// Attraction Showcase Section
$categories = [
    'city-tours' => [
        'label' => 'Tour Packages',
        'title' => 'Explore curated stories in every city',
        'description' => 'Small-group, concierge-led experiences designed around culture, cuisine, and local legends.',
    ],
    'car-rental' => [
        'label' => 'Car Rental',
        'title' => 'Chauffeur-driven journeys in premium comfort',
        'description' => 'Choose luxury sedans, SUVs, or classic rides with trusted drivers and concierge perks.',
    ],
    'airport-transport' => [
        'label' => 'Airport Transport',
        'title' => 'Seamless transfers with meet & greet hosts',
        'description' => 'Arrive relaxed with flight monitoring, lounge access, and personalized arrangements.',
    ],
    'hotel-booking' => [
        'label' => 'Hotel Booking',
        'title' => 'Premium accommodations across Oman',
        'description' => 'Discover luxury hotels and resorts with exclusive rates, personalized concierge services, and flexible booking options.',
    ],
];
?>
<section class="space-y-12 bg-[#f8fbff] py-10">
    <?php foreach ($categories as $categorySlug => $categoryInfo): 
        try {
            $packages = $api->getPackages(['category' => $categorySlug, 'limit' => 8]);
            $packagesList = $packages['data'] ?? [];
        } catch (Exception $e) {
            $packagesList = [];
        }
    ?>
        <div id="<?= $categorySlug ?>" class="relative mx-auto max-w-7xl space-y-10 px-4 py-10 scroll-mt-28 md:px-6 lg:px-8">
            <div class="text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-500)]">
                    <?= e($categoryInfo['label']) ?>
                </p>
                <h2 class="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                    <?= e($categoryInfo['title']) ?>
                </h2>
                <p class="mx-auto mt-4 max-w-3xl text-base text-slate-600">
                    <?= e($categoryInfo['description']) ?>
                </p>
            </div>
            <?php if (!empty($packagesList)): ?>
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <?php foreach (array_slice($packagesList, 0, 8) as $pkg): 
                            $image = $pkg['image'] ?? baseUrl('public/assets/hero/main.jpeg');
                            $price = formatCurrency($pkg['price'] ?? 0, $pkg['currency'] ?? 'INR');
                        ?>
                            <div class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <a href="<?= baseUrl($categorySlug . '/' . ($pkg['id'] ?? '')) ?>">
                                    <div class="aspect-[4/3] overflow-hidden">
                                        <img src="<?= e($image) ?>" alt="<?= e($pkg['title'] ?? '') ?>" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110">
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-lg font-semibold text-slate-900 mb-2"><?= e($pkg['title'] ?? '') ?></h3>
                                        <p class="text-sm text-slate-600 mb-4"><?= e(truncate($pkg['description'] ?? '', 80)) ?></p>
                                        <div class="flex items-center justify-between">
                                            <span class="text-xl font-bold text-[var(--color-brand-600)]"><?= $price ?></span>
                                            <span class="text-xs text-slate-500"><?= e($pkg['duration'] ?? '') ?></span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="flex justify-center">
                        <a href="<?= baseUrl($categorySlug) ?>" class="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]">
                            Explore More
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                        </a>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</section>

