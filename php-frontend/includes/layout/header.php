<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <title><?= e($pageTitle ?? 'City Muscat Tours | Bespoke Tours & Travel Experiences') ?></title>
    <meta name="description" content="<?= e($pageDescription ?? 'Discover curated tour packages, premium car rentals, and seamless airport transfers. Your journey to unforgettable experiences starts here.') ?>">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS Variables and Styles -->
    <style>
        :root {
            --font-family-sans: 'DM Sans', system-ui, -apple-system, "Segoe UI", sans-serif;
            --font-family-display: 'Playfair Display', "Times New Roman", serif;
            
            --color-brand-50: #f2f6ff;
            --color-brand-100: #e2ecff;
            --color-brand-200: #c5d8ff;
            --color-brand-300: #9ebcff;
            --color-brand-400: #7199ff;
            --color-brand-500: #4b76f6;
            --color-brand-600: #3557d9;
            --color-brand-700: #273fb3;
            --color-brand-800: #1f338f;
            --color-brand-900: #1d2f74;
            
            --color-secondary-500: #ff8057;
            --color-secondary-600: #f36940;
            --color-secondary-700: #d84d27;
            
            --color-surface: #f8fafc;
            --color-muted: #6b7280;
            --color-foreground: #0f172a;
            --color-background: #ffffff;
            --color-border: #e2e8f0;
            --color-success: #2dd4bf;
            --color-info: #38bdf8;
            
            --shadow-soft: 0 20px 45px -20px rgb(30 41 59 / 0.25);
            --shadow-card: 0 25px 50px -12px rgb(15 23 42 / 0.18);
            --shadow-glow: 0 0 0 1px rgb(113 153 255 / 0.12), 0 20px 40px -24px rgb(15 23 42 / 0.6);
            
            --radius-sm: 0.5rem;
            --radius-md: 1rem;
            --radius-lg: 1.5rem;
            --radius-xl: 2.5rem;
        }
        
        body {
            font-family: var(--font-family-sans);
            background-color: var(--color-background);
            color: var(--color-foreground);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .text-gradient {
            background-image: linear-gradient(115deg, var(--color-brand-500), var(--color-secondary-500));
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
        }
        
        .glass {
            background-color: rgb(255 255 255 / 0.65);
            backdrop-filter: blur(18px);
            border: 1px solid rgb(255 255 255 / 0.35);
            box-shadow: var(--shadow-soft);
        }
        
        .card {
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            background: rgb(255 255 255 / 0.96);
            box-shadow: var(--shadow-soft);
        }
        
        .shadow-soft {
            box-shadow: var(--shadow-soft);
        }
        
        .shadow-card {
            box-shadow: var(--shadow-card);
        }
        
        .shadow-glow {
            box-shadow: var(--shadow-glow);
        }
    </style>
    
    <!-- Tailwind Config -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f2f6ff',
                            100: '#e2ecff',
                            200: '#c5d8ff',
                            300: '#9ebcff',
                            400: '#7199ff',
                            500: '#4b76f6',
                            600: '#3557d9',
                            700: '#273fb3',
                            800: '#1f338f',
                            900: '#1d2f74',
                        },
                        secondary: {
                            500: '#ff8057',
                            600: '#f36940',
                            700: '#d84d27',
                        }
                    },
                    fontFamily: {
                        sans: ['var(--font-family-sans)', 'system-ui', 'sans-serif'],
                        display: ['var(--font-family-display)', 'serif'],
                    }
                }
            }
        }
    </script>
    
    <?php if (isset($additionalHead)): ?>
        <?= $additionalHead ?>
    <?php endif; ?>
</head>
<body class="bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
    <?php include INCLUDES_PATH . '/layout/navbar.php'; ?>
