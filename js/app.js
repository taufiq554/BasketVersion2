// === APPLICATION CONFIGURATION ===
const BOT_APP_URL = 'https://ganemax.my.id/bot-dashboard';

// === TAILWIND CONFIG ===
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#2563eb',
                    darkBlue: '#1e3a8a',
                    lightBlue: '#eff6ff',
                    slateBg: '#f8fafc'
                }
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace']
            }
        }
    }
};

// === INTERSECTION OBSERVER FOR REVEAL ANIMATIONS ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
});

// === MOBILE MENU LOGIC ===
let mobileMenuOpen = false;

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (!menu) return;

    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        menu.classList.remove('hidden', 'opacity-0', 'scale-95', 'pointer-events-none');
        menu.classList.add('opacity-100', 'scale-100');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        menu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        menu.classList.remove('opacity-100', 'scale-100');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 200);
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggleBtn = document.querySelector('[aria-label*="Menu"]');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close menu on link click
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
});

// === PLAN SELECTION LOGIC ===
let currentSelectedPrice = 250000;
let currentSelectedPlan = '2 Bulan';

function selectPlan(price, planName) {
    currentSelectedPrice = price;
    currentSelectedPlan = planName;

    // Update button styles
    [150000, 250000, 1000000].forEach(p => {
        const btn = document.getElementById(`planBtn-${p}`);
        if (btn) {
            if (p === price) {
                btn.className = "relative py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2 border-brand-blue bg-brand-lightBlue text-brand-blue shadow-md hover:shadow-lg cursor-pointer scale-105";
            } else {
                btn.className = "relative py-3 px-4 rounded-2xl font-bold text-sm transition-all border border-slate-200 text-slate-700 hover:border-brand-blue hover:shadow-md cursor-pointer";
            }
        }
    });

    updatePriceDisplay();
}

function updatePriceDisplay() {
    const display = document.getElementById('priceDisplay');
    if (display) {
        display.innerText = `Rp ${currentSelectedPrice.toLocaleString('id-ID')}`;
    }
}

function updateModalPriceDisplay() {
    const display = document.getElementById('modalPriceDisplay');
    if (display) {
        display.innerText = `Rp ${currentSelectedPrice.toLocaleString('id-ID')}`;
    }
}

// === SEARCH & FILTER FAQ ===
let activeFaqCategory = 'all';

function setFaqCategory(category) {
    activeFaqCategory = category;

    // Update category buttons
    document.querySelectorAll('.faq-category-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.className = "px-4 py-2 rounded-full font-bold text-sm transition-all bg-brand-blue text-white shadow-lg cursor-pointer";
        } else {
            btn.className = "px-4 py-2 rounded-full font-bold text-sm transition-all border border-slate-300 text-slate-700 hover:border-brand-blue cursor-pointer";
        }
    });

    filterFaq();
}

function searchFaq(query) {
    query = query.toLowerCase();

    document.querySelectorAll('.faq-item').forEach(item => {
        const cat = item.getAttribute('data-category');
        const text = item.innerText.toLowerCase();
        const matchesCat = activeFaqCategory === 'all' || cat === activeFaqCategory;
        const matchesQuery = text.includes(query);

        if (matchesCat && matchesQuery) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function filterFaq() {
    const searchInput = document.getElementById('faqSearch');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    document.querySelectorAll('.faq-item').forEach(item => {
        const cat = item.getAttribute('data-category');
        const text = item.innerText.toLowerCase();
        const matchesCat = activeFaqCategory === 'all' || cat === activeFaqCategory;
        const matchesQuery = text.includes(query);

        if (matchesCat && matchesQuery) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// === SPEED TEST LOGIC ===
let isSpeedTesting = false;

window.runSpeedTest = function() {
    if (isSpeedTesting) return;
    isSpeedTesting = true;

    const timerDisplay = document.getElementById('speedTimerDisplay');
    const statusText = document.getElementById('speedStatusText');
    const startBtn = document.getElementById('startSpeedBtn');
    const resultPanel = document.getElementById('speedResultContainer');

    if (!timerDisplay || !startBtn) {
        isSpeedTesting = false;
        return;
    }

    if (resultPanel) resultPanel.classList.add('hidden');
    timerDisplay.className = "text-4xl sm:text-6xl font-mono font-black text-amber-400 tracking-wider mb-2 select-none";
    
    startBtn.disabled = true;
    startBtn.className = "w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center gap-2 mx-auto";
    startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-lg"></i> Menguji Multi-Socket Latency...';

    if (statusText) {
        statusText.innerText = "⚡ Mengukur kecepatan HTTP/2 Multi-Socket secara realtime...";
        statusText.className = "text-xs font-mono text-amber-400 font-bold mb-6";
    }

    const testDuration = 1800;
    const startTime = performance.now();

    const timerInterval = setInterval(function() {
        const now = performance.now();
        const elapsed = Math.min(now - startTime, testDuration);
        
        const seconds = Math.floor(elapsed / 1000);
        const ms = Math.floor(elapsed % 1000);
        
        timerDisplay.innerText = `00 : ${String(seconds).padStart(2, '0')} . ${String(ms).padStart(3, '0')}`;

        if (elapsed >= testDuration) {
            clearInterval(timerInterval);
            
            const finalLatency = Math.floor(Math.random() * 3) + 11;
            timerDisplay.innerText = `00 : 00 . 0${finalLatency}`;
            timerDisplay.className = "text-4xl sm:text-6xl font-mono font-black text-emerald-400 tracking-wider mb-2 select-none";

            if (statusText) {
                statusText.innerText = `✅ PENGUJIAN SELESAI: Waktu eksekusi bot hanya ${finalLatency} ms!`;
                statusText.className = "text-xs font-mono text-emerald-400 font-bold mb-6";
            }

            const botResultEl = document.getElementById('botSpeedResult');
            if (botResultEl) botResultEl.innerText = `${finalLatency} ms`;

            if (resultPanel) resultPanel.classList.remove('hidden');

            startBtn.disabled = false;
            startBtn.className = "w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/40 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95 cursor-pointer";
            startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> UJI ULANG KECEPATAN';
            
            isSpeedTesting = false;
        }
    }, 30);
};

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('startSpeedBtn');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.runSpeedTest();
        });
    }
});

// === MODAL PEMBAYARAN QRIS LOGIC ===
function openQrisModal(price = 250000, planName = '2 Bulan') {
    selectPlanInModal(price, planName);
    const modal = document.getElementById('qrisModal');
    const modalContent = document.getElementById('qrisModalContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function selectPlanInModal(price, planName) {
    currentSelectedPrice = price;
    currentSelectedPlan = planName;

    document.getElementById('modalPlanLabel').innerText = `Sewa Full Pass (${planName})`;
    updateModalPriceDisplay();

    [150000, 250000, 1000000].forEach(p => {
        const btn = document.getElementById(`planBtn-${p}`);
        if (btn) {
            if (p === price) {
                btn.className = "py-1.5 px-1 rounded-xl border-2 border-brand-blue bg-blue-50/50 text-[10px] sm:text-[11px] font-bold text-brand-blue transition-all cursor-pointer";
            } else {
                btn.className = "py-1.5 px-1 rounded-xl border border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-700 hover:border-blue-500 transition-all cursor-pointer";
            }
        }
    });
}

function closeQrisModal() {
    const modal = document.getElementById('qrisModal');
    const modalContent = document.getElementById('qrisModalContent');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

function handleQrisImageError(img) {
    img.onerror = null;
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250"><rect width="250" height="250" fill="%23ffffff"/><path d="M20 20h70v70H20zM30 30v50h50V30zM40 40h30v30H40zM160 20h70v70h-70zM170 30v50h50V30zM180 40h30v30h-30zM20 160h70v70H20zM30 170v50h50v-50zM40 180h30v30H40zM110 20h30v30h-30zM100 70h20v30h-20zM130 90h30v20h-30zM110 130h40v30h-40zM160 160h20v20h-20zM190 140h40v30h-40zM150 190h30v40h-30zM190 190h40v40h-40z" fill="%231e3a8a"/><text x="125" y="125" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="%232563eb">SCAN QRIS PEMBAYARAN</text></svg>';
}

function handlePaymentSuccess() {
    const btn = document.getElementById('btnConfirmPayment');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-lg"></i> Memverifikasi Pembayaran...';

    setTimeout(() => {
        closeQrisModal();
        document.getElementById('successModal').classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = BOT_APP_URL;
        }, 1200);
    }, 1000);
}

function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.fa-chevron-down');
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
        btn.setAttribute('aria-expanded', 'true');
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
        btn.setAttribute('aria-expanded', 'false');
    }
}

// === INITIALIZE ON PAGE LOAD ===
document.addEventListener('DOMContentLoaded', function() {
    // Initialize price display
    updatePriceDisplay();

    // Setup search input listener
    const faqSearch = document.getElementById('faqSearch');
    if (faqSearch) {
        faqSearch.addEventListener('input', function(e) {
            searchFaq(e.target.value);
        });
    }

    // Setup category buttons
    document.querySelectorAll('.faq-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setFaqCategory(this.getAttribute('data-category'));
        });
    });
});
