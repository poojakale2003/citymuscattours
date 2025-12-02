<?php
// Testimonials Section
try {
    $testimonials = $api->getTestimonials(['active' => true, 'limit' => 100]);
    $testimonialsList = $testimonials['data'] ?? [];
    $testimonialsList = array_filter($testimonialsList, function($t) {
        return ($t['is_active'] ?? true) !== false;
    });
    usort($testimonialsList, function($a, $b) {
        return ($a['display_order'] ?? 0) - ($b['display_order'] ?? 0);
    });
} catch (Exception $e) {
    $testimonialsList = [];
}
?>
<section id="testimonials" class="relative mx-auto max-w-6xl px-6 py-10 md:px-8 lg:px-12 bg-[#f8fbff]">
    <div class="flex flex-col gap-4 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-500)]">
            Loving Reviews By Our Customers
        </p>
        <h2 class="text-3xl font-bold text-slate-900 md:text-4xl">
            Hear from frequent Dreamers
        </h2>
        <p class="mx-auto max-w-3xl text-base leading-relaxed text-slate-600">
            Real experiences from travelers who have explored the world with us. 
            Discover what makes our journeys unforgettable.
        </p>
    </div>

    <?php if (!empty($testimonialsList)): ?>
        <div class="relative mt-12 overflow-hidden">
            <div class="testimonial-track flex w-max gap-6">
                <?php
                $totalDisplayed = 40;
                $needed = $totalDisplayed;
                for ($i = 0; $i < $needed; $i++):
                    $testimonial = $testimonialsList[$i % count($testimonialsList)];
                    $avatar = $testimonial['avatar'] ?? '';
                    if ($avatar && !preg_match('/^https?:\/\//', $avatar)) {
                        $avatar = API_BASE_URL . '/../public' . ($avatar[0] === '/' ? $avatar : '/' . $avatar);
                    }
                ?>
                    <article class="group flex w-[280px] min-w-[280px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60 sm:w-[320px] sm:min-w-[320px] sm:px-6 sm:py-6">
                        <div class="flex items-start gap-4">
                            <?php if ($avatar): ?>
                                <img src="<?= e($avatar) ?>" alt="<?= e($testimonial['name'] ?? '') ?>" class="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16">
                                    <?= strtoupper(substr(($testimonial['name'] ?? ''), 0, 2)) ?>
                                </div>
                            <?php else: ?>
                                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16">
                                    <?= strtoupper(substr(($testimonial['name'] ?? ''), 0, 2)) ?>
                                </div>
                            <?php endif; ?>
                            <div class="flex-1 space-y-2">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900 sm:text-base"><?= e($testimonial['name'] ?? '') ?></p>
                                        <p class="text-xs text-slate-500"><?= e($testimonial['location'] ?? '') ?></p>
                                    </div>
                                    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0ff] text-[#2164f3] shadow-[0_4px_10px_-4px_rgba(33,100,243,0.4)] sm:h-12 sm:w-12">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 sm:h-6 sm:w-6">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="flex items-center gap-1 text-[#facc15]">
                                    <?php for ($j = 1; $j <= 5; $j++): ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 sm:h-4 sm:w-4 <?= $j <= ($testimonial['rating'] ?? 5) ? '' : 'opacity-30' ?>">
                                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    <?php endfor; ?>
                                </div>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-slate-600 sm:text-sm"><?= e($testimonial['quote'] ?? '') ?></p>
                    </article>
                <?php endfor; ?>
                <?php // Duplicate for seamless loop
                for ($i = 0; $i < $needed; $i++):
                    $testimonial = $testimonialsList[$i % count($testimonialsList)];
                    $avatar = $testimonial['avatar'] ?? '';
                    if ($avatar && !preg_match('/^https?:\/\//', $avatar)) {
                        $avatar = API_BASE_URL . '/../public' . ($avatar[0] === '/' ? $avatar : '/' . $avatar);
                    }
                ?>
                    <article class="group flex w-[280px] min-w-[280px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60 sm:w-[320px] sm:min-w-[320px] sm:px-6 sm:py-6">
                        <div class="flex items-start gap-4">
                            <?php if ($avatar): ?>
                                <img src="<?= e($avatar) ?>" alt="<?= e($testimonial['name'] ?? '') ?>" class="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16">
                                    <?= strtoupper(substr(($testimonial['name'] ?? ''), 0, 2)) ?>
                                </div>
                            <?php else: ?>
                                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16">
                                    <?= strtoupper(substr(($testimonial['name'] ?? ''), 0, 2)) ?>
                                </div>
                            <?php endif; ?>
                            <div class="flex-1 space-y-2">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900 sm:text-base"><?= e($testimonial['name'] ?? '') ?></p>
                                        <p class="text-xs text-slate-500"><?= e($testimonial['location'] ?? '') ?></p>
                                    </div>
                                    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0ff] text-[#2164f3] shadow-[0_4px_10px_-4px_rgba(33,100,243,0.4)] sm:h-12 sm:w-12">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 sm:h-6 sm:w-6">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="flex items-center gap-1 text-[#facc15]">
                                    <?php for ($j = 1; $j <= 5; $j++): ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 sm:h-4 sm:w-4 <?= $j <= ($testimonial['rating'] ?? 5) ? '' : 'opacity-30' ?>">
                                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    <?php endfor; ?>
                                </div>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-slate-600 sm:text-sm"><?= e($testimonial['quote'] ?? '') ?></p>
                    </article>
                <?php endfor; ?>
            </div>
            <div class="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f8fbff] to-transparent"></div>
            <div class="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f8fbff] to-transparent"></div>
        </div>
    <?php endif; ?>
</section>

<style>
@keyframes testimonial-marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
.testimonial-track {
    animation: testimonial-marquee 90s linear infinite;
}
.testimonial-track:hover {
    animation-play-state: paused;
}
</style>

