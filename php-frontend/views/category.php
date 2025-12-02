<?php
$category = routeParam('category', 'city-tours');
$categoryName = getCategoryDisplayName($category);

$pageTitle = $categoryName . ' - City Muscat Tours';
$pageDescription = 'Explore our ' . strtolower($categoryName) . ' packages';

include INCLUDES_PATH . '/layout/header.php';

try {
    $packages = $api->getPackages(['category' => $category]);
    $packagesList = $packages['data'] ?? [];
} catch (Exception $e) {
    $packagesList = [];
    $error = $e->getMessage();
}
?>

<main class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative h-64 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40"></div>
        <img src="<?= baseUrl('public/assets/hero/' . str_replace('-', '-', $category) . '.jpg') ?>" alt="<?= e($categoryName) ?>" class="h-full w-full object-cover" onerror="this.src='<?= baseUrl('public/assets/hero/main.jpeg') ?>'">
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white px-4">
                <h1 class="text-4xl md:text-5xl font-bold mb-4"><?= e($categoryName) ?></h1>
                <p class="text-lg">Discover our curated <?= strtolower($categoryName) ?> options</p>
            </div>
        </div>
    </section>

    <!-- Packages Grid -->
    <section class="py-16 px-4">
        <div class="mx-auto max-w-7xl">
            <?php if (isset($error)): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    Error loading packages: <?= e($error) ?>
                </div>
            <?php endif; ?>

            <?php if (empty($packagesList)): ?>
                <div class="text-center py-12">
                    <p class="text-slate-600 text-lg">No packages found in this category.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($packagesList as $pkg): 
                        $image = $pkg['image'] ?? baseUrl('public/assets/hero/main.jpeg');
                        $price = formatCurrency($pkg['price'] ?? 0, $pkg['currency'] ?? 'INR');
                        $detailUrl = baseUrl($category . '/' . ($pkg['id'] ?? ''));
                    ?>
                        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                            <a href="<?= $detailUrl ?>">
                                <div class="aspect-[4/3] overflow-hidden">
                                    <img src="<?= e($image) ?>" alt="<?= e($pkg['title'] ?? '') ?>" class="h-full w-full object-cover">
                                </div>
                                <div class="p-6">
                                    <h3 class="text-xl font-semibold text-slate-900 mb-2"><?= e($pkg['title'] ?? '') ?></h3>
                                    <p class="text-sm text-slate-600 mb-4"><?= e(truncate($pkg['description'] ?? '', 100)) ?></p>
                                    <div class="flex items-center justify-between">
                                        <span class="text-2xl font-bold text-[var(--color-brand-600)]"><?= $price ?></span>
                                        <span class="text-sm text-slate-500"><?= e($pkg['duration'] ?? '') ?></span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php include INCLUDES_PATH . '/layout/footer.php'; ?>

