    <?php include INCLUDES_PATH . '/layout/footer-content.php'; ?>
    
    <!-- Scripts -->
    <script>
        // API Base URL for JavaScript
        window.API_BASE_URL = '<?= API_BASE_URL ?>';
        
        // CSRF Token
        window.csrfToken = '<?= csrfToken() ?>';
    </script>
    
    <?php if (isset($additionalScripts)): ?>
        <?= $additionalScripts ?>
    <?php endif; ?>
</body>
</html>

