/* ============================================================
   م. ماجد طارق موسى - مهندس مساحة
   ملف الجافاسكربت
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1) شريط التنقل : تغيير الخلفية عند التمرير ---------- */
    const navbar = document.getElementById('navbar');
    const toTop = document.getElementById('toTop');

    function onScroll() {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 40);
        toTop.classList.toggle('show', y > 420);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- 2) قائمة الجوال ---------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        navLinks.classList.toggle('open');
        navToggle.innerHTML = navLinks.classList.contains('open')
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            navLinks.classList.remove('open');
            navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });

    /* ---------- 3) نافذة عرض الصور المكبرة (Lightbox) ---------- */
    const lightbox = document.getElementById('lightbox');
    const lbImage = document.getElementById('lbImage');
    const lbCaption = document.getElementById('lbCaption');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');

    // كل العناصر التي يمكن تكبيرها (الغلاف + الصورة الشخصية + المعرض)
    const zoomables = Array.from(document.querySelectorAll('[data-lightbox]'));
    let currentIndex = 0;

    function showImage(index) {
        currentIndex = (index + zoomables.length) % zoomables.length;
        const el = zoomables[currentIndex];
        lbImage.src = el.getAttribute('data-img');
        lbImage.alt = el.getAttribute('data-caption') || 'صورة';
        lbCaption.textContent = el.getAttribute('data-caption') || '';
    }

    function openLightbox(index) {
        showImage(index);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    zoomables.forEach(function (el, i) {
        el.addEventListener('click', function () {
            openLightbox(i);
        });
        // دعم لوحة المفاتيح
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(i);
            }
        });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showImage(currentIndex - 1); });
    lbNext.addEventListener('click', function () { showImage(currentIndex + 1); });

    // إغلاق عند الضغط على الخلفية
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // التحكم بلوحة المفاتيح
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex + 1);
        if (e.key === 'ArrowRight') showImage(currentIndex - 1);
    });

    // سحب باللمس (Swipe) للجوال
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) < 60) return;
        if (diff > 0) showImage(currentIndex - 1);
        else showImage(currentIndex + 1);
    }, { passive: true });

    /* ---------- 4) ظهور تدريجي للعناصر عند التمرير ---------- */
    const revealTargets = document.querySelectorAll(
        '.service-card, .about-grid, .contact-card, .stat, .social'
    );

    revealTargets.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });

    /* ---------- 5) الوضع اللي / النهاري ---------- */
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');

    function applyTheme(isDark) {
        document.body.classList.toggle('dark', isDark);
        themeIcon.className = isDark
            ? 'fa-solid fa-sun'
            : 'fa-solid fa-moon';
        themeBtn.setAttribute('aria-label',
            isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع اللي');
        try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
    }

    // استرجاع الاختيار المحفوظ أو تفضيل النظام
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    const prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    applyTheme(saved ? saved === 'dark' : prefersDark);

    themeBtn.addEventListener('click', function () {
        applyTheme(!document.body.classList.contains('dark'));
    });

    /* ---------- 6) السنة في الفوتر ---------- */
    document.getElementById('year').textContent = new Date().getFullYear();
});

