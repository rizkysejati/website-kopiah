// Data Produk menggunakan file produk1.jpg
const products = [
    { id: 1, name: "Kopi Susu Gula Aren 250ml", price: 13000, desc: "Kopi pilihan, susu creamy & gula aren asli.", img: "produk1.jpg" }
];

let cart = {};
let userLocation = "-";

function renderProducts() {
    const list = document.getElementById('product-list');
    if (!list) return;
    list.innerHTML = '';
    products.forEach(p => {
        list.innerHTML += `
            <div class="product-card">
                <img src="${p.img}" class="product-img" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <div class="product-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                </div>
                <button class="btn-add" id="btn-add-${p.id}" onclick="addToCart(${p.id})"><i class="fa-solid fa-plus"></i> Tambah</button>
            </div>
        `;
    });
}

function addToCart(id) {
    if(!cart[id]) {
        cart[id] = { ...products.find(p => p.id === id), qty: 1 };
    } else {
        cart[id].qty++;
    }
    
    // Trigger Animasi Tombol Tambah & Badge Keranjang
    const btn = document.getElementById(`btn-add-${id}`);
    if(btn) {
        btn.classList.add('pulse-anim');
        setTimeout(() => btn.classList.remove('pulse-anim'), 400);
    }

    const badge = document.getElementById('cart-badge');
    if(badge) {
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 300);
    }

    updateCartUI();
}

function changeQty(id, delta) {
    cart[id].qty += delta;
    if(cart[id].qty <= 0) {
        delete cart[id];
    }
    updateCartUI();
}

function updateCartUI() {
    let totalQty = 0;
    let totalPrice = 0;
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';

    let keys = Object.keys(cart);
    if(keys.length === 0) {
        container.innerHTML = '<div class="empty-cart">Keranjang belanjaanmu masih kosong.</div>';
    } else {
        keys.forEach(id => {
            let item = cart[id];
            totalQty += item.qty;
            totalPrice += item.price * item.qty;
            container.innerHTML += `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</small>
                    </div>
                    <div class="cart-controls">
                        <button onclick="changeQty(${id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('cart-badge').innerText = totalQty;
    document.getElementById('cart-total').innerText = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

function openCartModal() {
    document.getElementById('cart-modal').classList.add('active');
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('active');
}

// Fitur GPS Deteksi Lokasi Google Maps
function getLocation() {
    const status = document.getElementById('location-status');
    if (!navigator.geolocation) {
        status.innerText = "Browser tidak mendukung deteksi lokasi.";
        return;
    }
    status.innerText = "Mendeteksi lokasi GPS...";
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        userLocation = `https://www.google.com/maps?q=${lat},${lon}`;
        document.getElementById('buyer-maps').value = userLocation;
        status.innerHTML = "✅ Lokasi berhasil dideteksi! (<a href='" + userLocation + "' target='_blank'>Cek Peta</a>)";
    }, () => {
        status.innerText = "Gagal mendeteksi lokasi. Pastikan izin GPS aktif.";
    });
}

// Kirim ke WhatsApp Admin (Nomor: 081242393442)
function checkoutWhatsApp() {
    const name = document.getElementById('buyer-name').value.trim();
    const address = document.getElementById('buyer-address').value.trim();
    const maps = document.getElementById('buyer-maps').value;

    if(!name || !address) {
        alert("Harap isi Nama Pemesan dan Alamat/Kelas terlebih dahulu!");
        return;
    }

    let keys = Object.keys(cart);
    if(keys.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    let message = `Halo Admin KOPIAH, saya ingin memesan Pre-Order:%0A%0A`;
    message += `*Nama:* ${name}%0A`;
    message += `*Alamat/Kelas:* ${address}%0A`;
    message += `*Titik Lokasi Maps:* ${maps}%0A%0A`;
    message += `*Pesanan:*%0A`;

    let totalPrice = 0;
    keys.forEach(id => {
        let item = cart[id];
        let subtotal = item.price * item.qty;
        totalPrice += subtotal;
        message += `- ${item.name} x${item.qty} (Rp ${subtotal.toLocaleString('id-ID')})%0A`;
    });

    message += `%0A*Total Pembayaran:* Rp ${totalPrice.toLocaleString('id-ID')}`;

    const adminPhone = "6281242393442"; 
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
}

renderProducts();
updateCartUI();