<section class="relative isolate">
    <div class="relative h-96 w-full overflow-hidden sm:h-[28rem] md:h-[32rem] lg:h-[36rem] xl:h-[40rem]">
        <img src="<?= baseUrl('public/assets/video.jpeg') ?>" alt="citymuscattours cinematic moment" class="h-full w-full object-cover">
        <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,16,36,0.45),rgba(12,16,36,0.7))]"></div>
        <button
            type="button"
            onclick="openVideoModal()"
            class="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-brand-600)] shadow-lg transition hover:scale-105 sm:h-14 sm:w-14 md:h-16 md:w-16"
            aria-label="Play video"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5 h-6 w-6 sm:ml-1 sm:h-7 sm:w-7 md:h-8 md:w-8">
                <path d="M8 5v14l11-7z" />
            </svg>
        </button>
    </div>

    <div id="video-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4 sm:p-6 md:p-8" onclick="closeVideoModal()">
        <div class="relative w-full max-w-4xl" onclick="event.stopPropagation()">
            <button
                type="button"
                onclick="closeVideoModal()"
                class="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 sm:-right-3 sm:-top-3 sm:h-10 sm:w-10"
                aria-label="Close video"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 sm:h-5 sm:w-5">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <div class="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl sm:rounded-2xl md:rounded-3xl">
                <iframe
                    title="citymuscattours cinematic film"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="h-full w-full"
                    id="video-iframe"
                ></iframe>
            </div>
        </div>
    </div>
</section>

<script>
function openVideoModal() {
    document.getElementById('video-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.add('hidden');
    document.body.style.overflow = '';
    // Stop video
    const iframe = document.getElementById('video-iframe');
    if (iframe) {
        iframe.src = iframe.src;
    }
}

// Close on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeVideoModal();
    }
});
</script>

