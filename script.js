/* ===== Konfigurasi ===== */
const ADMIN_PHONE = "6281242393442";
const IMG_DIR = "aset/"; // folder tempat semua foto

const products = [
    { id: 1, name: "Kopi Susu Gula Aren 250ml", price: 13000, desc: "Kopi pilihan, susu creamy, dan gula aren asli.", img: "menu-kopsus" },
    { id: 2, name: "Ice Americano 250ml", price: 10000, desc: "Espresso segar dengan es, ringan dan menyegarkan.", img: "menu-americano" },
    { id: 3, name: "Matcha Latte 250ml", price: 15000, desc: "Matcha lembut berpadu susu, manis seimbang.", img: "menu-matcha" }
];

/* ===== State ===== */
let cart = loadCart();
let userLocation = "-";
let toastTimer;

const rupiah = n => "Rp " + n.toLocaleString("id-ID");
const $ = id => document.getElementById(id);

function loadCart() {
    try { return JSON.parse(localStorage.getItem("kopiah-cart")) || {}; }
    catch (e) { return {}; }
}
function saveCart() {
    try { localStorage.setItem("kopiah-cart", JSON.stringify(cart)); } catch (e) {}
}

/* ===== Dark mode ===== */
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $("theme-icon").className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    try { localStorage.setItem("kopiah-theme", theme); } catch (e) {}
}
$("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});
applyTheme(document.documentElement.getAttribute("data-theme") || "light");

/* ===== Menu ===== */
function renderProducts() {
    $("product-list").innerHTML = products.map(p => `
        <article class="card product-card">
            <div class="img-box">
                <img data-base="${p.img}" data-fallback="${p.fallback || ''}" alt="${p.name}">
            </div>
            <div class="card-body">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <div class="product-price">${rupiah(p.price)}</div>
                <button class="btn-add" id="btn-add-${p.id}" type="button" onclick="addToCart(${p.id})">
                    <i class="fa-solid fa-plus"></i> Tambah
                </button>
            </div>
        </article>
    `).join("");
}

/* ===== Toast ===== */
function showToast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ===== Keranjang ===== */
function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    cart[id] = cart[id] ? { ...cart[id], qty: cart[id].qty + 1 } : { id: p.id, qty: 1 };

    const btn = $(`btn-add-${id}`);
    btn.classList.add("pulse-anim");
    setTimeout(() => btn.classList.remove("pulse-anim"), 400);

    document.querySelectorAll(".cart-badge").forEach(b => {
        b.classList.add("bounce");
        setTimeout(() => b.classList.remove("bounce"), 300);
    });

    updateCartUI();
    showToast(`${p.name} ditambahkan ke keranjang`);
}

function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    updateCartUI();
}

function removeItem(id) {
    delete cart[id];
    updateCartUI();
}

function cartLines() {
    return Object.values(cart)
        .map(c => ({ ...products.find(p => p.id === c.id), qty: c.qty }))
        .filter(i => i.name);
}

function cartTotal() {
    return cartLines().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
    const lines = cartLines();
    const qty = lines.reduce((s, i) => s + i.qty, 0);
    const total = cartTotal();

    $("cart-items").innerHTML = lines.length
        ? lines.map(i => `
            <div class="cart-item">
                <div><strong>${i.name}</strong><br><small>${rupiah(i.price)} x ${i.qty}</small></div>
                <div class="cart-controls">
                    <button type="button" onclick="changeQty(${i.id}, -1)" aria-label="Kurangi">-</button>
                    <span>${i.qty}</span>
                    <button type="button" onclick="changeQty(${i.id}, 1)" aria-label="Tambah">+</button>
                    <button type="button" class="remove" onclick="removeItem(${i.id})" aria-label="Hapus ${i.name}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`).join("")
        : '<div class="empty-cart">Keranjang masih kosong. Pilih menu dulu, yuk.</div>';

    document.querySelectorAll(".cart-badge").forEach(b => (b.textContent = qty));
    $("cart-total").textContent = rupiah(total);
    $("qris-total").textContent = rupiah(total);
    saveCart();
}

function openCart() {
    $("cart-modal").classList.add("active");
    $("cart-modal").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}
function closeCart() {
    $("cart-modal").classList.remove("active");
    $("cart-modal").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}
$("cart-modal").addEventListener("click", e => { if (e.target === $("cart-modal")) closeCart(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

/* ===== Lokasi GPS ===== */
function getLocation() {
    const status = $("location-status");
    if (!navigator.geolocation) {
        status.textContent = "Browser tidak mendukung deteksi lokasi.";
        return;
    }
    status.textContent = "Mendeteksi lokasi...";
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        userLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
        status.innerHTML = `Lokasi terdeteksi. <a href="${userLocation}" target="_blank" rel="noopener">Cek di peta</a>`;
    }, () => {
        status.textContent = "Gagal mendeteksi lokasi. Pastikan izin GPS aktif.";
    });
}

/* ===== Pembayaran ===== */
function getPayment() {
    return document.querySelector('input[name="payment"]:checked').value;
}

function updatePaymentUI() {
    const isQris = getPayment() === "qris";
    $("qris-box").hidden = !isQris;
    $("checkout-label").textContent = isQris
        ? "Kirim Bukti Pembayaran ke WhatsApp"
        : "Pesan via WhatsApp (COD)";
}
document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener("change", updatePaymentUI));

/* ===== Checkout ke WhatsApp ===== */
function checkout() {
    const nameEl = $("buyer-name");
    const addrEl = $("buyer-address");
    const name = nameEl.value.trim();
    const address = addrEl.value.trim();
    const lines = cartLines();

    nameEl.classList.toggle("invalid", !name);
    addrEl.classList.toggle("invalid", !address);

    if (!lines.length) { showToast("Keranjang masih kosong"); return; }
    if (!name || !address) { showToast("Isi nama dan alamat/kelas dulu"); return; }

    const isQris = getPayment() === "qris";
    let msg = "Halo Admin KOPIAH, saya ingin memesan Pre-Order:\n\n";
    msg += `*Nama:* ${name}\n`;
    msg += `*Alamat/Kelas:* ${address}\n`;
    msg += `*Titik Lokasi:* ${userLocation}\n\n`;
    msg += "*Pesanan:*\n";
    lines.forEach(i => { msg += `- ${i.name} x${i.qty} (${rupiah(i.price * i.qty)})\n`; });
    msg += `\n*Total:* ${rupiah(cartTotal())}\n`;
    msg += `*Pembayaran:* ${isQris ? "QRIS" : "COD (bayar di tempat)"}\n`;
    if (isQris) msg += "\nSaya sudah membayar via QRIS. Bukti pembayaran (screenshot) saya lampirkan di chat ini.";

    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

/* ===== Menu navbar aktif saat scroll ===== */
const navLinks = document.querySelectorAll(".nav-links a");
const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
}, { rootMargin: "-45% 0px -50% 0px" });
["beranda", "promo", "menu", "ulasan", "tentang"].forEach(id => {
    const el = $(id);
    if (el) spy.observe(el);
});

/* ===== Pemuat foto: cari di folder aset/ lalu folder utama, coba beberapa ekstensi ===== */
const LOGO_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo KOPIAH">
<g transform="rotate(-20 32 42)"><ellipse cx="32" cy="42" rx="16" ry="21" fill="#6B3F26" stroke="#F6F6EB" stroke-width="2"/><path d="M32 22 C25 33 39 46 32 62" fill="none" stroke="#F6F6EB" stroke-width="2.5" stroke-linecap="round"/></g>
<path d="M18 21 v8 c0 4 28 4 28 0 v-8" fill="#8E2A20" stroke="#F6F6EB" stroke-width="2" stroke-linejoin="round"/>
<polygon points="32,5 58,16 32,27 6,16" fill="#C0392B" stroke="#F6F6EB" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 18 V31" stroke="#F6F6EB" stroke-width="2" stroke-linecap="round"/><circle cx="54" cy="33" r="2.5" fill="#F6F6EB"/></svg>`;

function smartImage(img) {
    const isLogo = img.hasAttribute("data-logo");
    const base = isLogo ? "logo-kopiah" : img.dataset.base;
    const list = [];
    [IMG_DIR, ""].forEach(dir => ["png", "jpg", "jpeg", "webp"].forEach(ext => list.push(`${dir}${base}.${ext}`)));
    let i = 0;
    img.onerror = () => {
        i++;
        if (i < list.length) { img.src = list[i]; return; }
        img.onerror = null;
        console.warn(`Foto "${base}" tidak ditemukan. Sudah dicoba:`, list);
        if (isLogo) {
            const holder = document.createElement("span");
            holder.className = img.className;
            holder.innerHTML = LOGO_SVG;
            img.replaceWith(holder);
        } else {
            const parent = img.parentNode;
            img.remove();
            parent.classList.add("empty");
        }
    };
    img.src = list[0];
}

/* ===== Init ===== */
renderProducts();
document.querySelectorAll("img[data-base], img[data-logo]").forEach(smartImage);
updateCartUI();
updatePaymentUI();
