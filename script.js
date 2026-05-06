// Initialize Lucide Icons
lucide.createIcons();

// Supabase Configuration
const SUPABASE_URL = 'https://xxvxynoesnpiitlbglpk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dnh5bm9lc25waWl0bGJnbHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzA2NjcsImV4cCI6MjA5MzM0NjY2N30.ZZ5drqV3hnO68ZTZ1nkhrs_JN3lz_987fIDsLeyYSgE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Sample Menu Data
const defaultProducts = [
    {
        id: 1,
        name: "إسبريسو",
        price: 45,
        category: "قهوة ساخنة",
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=500",
        description: "قهوة مركزة وغنية بالنكهة"
    },
    {
        id: 2,
        name: "كابتشينو",
        price: 65,
        category: "قهوة ساخنة",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=500",
        description: "إسبريسو مع حليب مبخر ورغوة غنية"
    },
    {
        id: 3,
        name: "لاتيه بارد",
        price: 75,
        category: "مشروبات باردة",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500",
        description: "إسبريسو مع حليب بارد وثلج"
    },
    {
        id: 4,
        name: "موكا مثلجة",
        price: 85,
        category: "مشروبات باردة",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=500",
        description: "مزيج الشوكولاتة والقهوة مع الثلج"
    },
    {
        id: 5,
        name: "كيكة الشوكولاتة",
        price: 90,
        category: "حلويات",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=500",
        description: "كيكة غنية بقطع الشوكولاتة الذائبة"
    },
    {
        id: 6,
        name: "تشيز كيك",
        price: 95,
        category: "حلويات",
        image: "https://images.unsplash.com/photo-1524350300363-0233e515918e?auto=format&fit=crop&q=80&w=500",
        description: "تشيز كيك كريمي مع صوص التوت"
    },
    {
        id: 7,
        name: "فلات وايت",
        price: 70,
        category: "قهوة ساخنة",
        image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=500",
        description: "توازن مثالي بين الإسبريسو والحليب"
    },
    {
        id: 8,
        name: "سموثي مانجو",
        price: 80,
        category: "مشروبات باردة",
        image: "https://images.unsplash.com/photo-1525385133335-842822916523?auto=format&fit=crop&q=80&w=500",
        description: "مانجو طازجة ومثلجة"
    }
];

// Initialize Products from Supabase or use defaults
let products = [];

async function fetchProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*, product_recipes(*)');
    
    if (error) {
        console.error('Error fetching products:', error);
        products = defaultProducts;
    } else {
        products = data.length > 0 ? data : defaultProducts;
    }
    renderProducts(document.querySelector('.category-btn.active')?.innerText || 'الكل');
}

// Subscribe to real-time changes
supabaseClient
    .channel('public:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        fetchProducts();
    })
    .subscribe();

// Cart State
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

// Functions
function renderProducts(filter = 'الكل', isUpdate = false) {
    const filteredProducts = filter === 'الكل' 
        ? products 
        : products.filter(p => p.category === filter);

    productsGrid.innerHTML = filteredProducts.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        const isOutOfStock = product.is_inventory_tracked && product.stock_quantity <= 0;

        return `
            <div class="product-card rounded-3xl overflow-hidden ${isUpdate ? 'opacity-100 transform-none' : 'scroll-reveal'} ${isOutOfStock ? 'opacity-60 grayscale' : ''}">
                <div class="relative h-40 md:h-64">
                    ${isOutOfStock ? `
                        <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                            <span class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl">نفذ من المخزون</span>
                        </div>
                    ` : ''}
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-3 right-3 left-3">
                        <span class="bg-red-600/90 text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${product.category}</span>
                        <h3 class="text-sm md:text-xl font-bold mt-1 line-clamp-1">${product.name}</h3>
                    </div>
                </div>
                <div class="p-3 md:p-4 flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-lg md:text-2xl font-black text-red-500">${product.price}</span>
                            <span class="text-[10px] md:text-xs text-gray-400 mr-1">ج.م</span>
                        </div>
                        
                        ${isOutOfStock ? `
                            <button disabled class="p-2 md:p-3 bg-white/5 text-gray-600 rounded-xl md:rounded-2xl cursor-not-allowed">
                                <i data-lucide="slash" class="w-4 h-4 md:w-6 md:h-6"></i>
                            </button>
                        ` : (quantity === 0 ? `
                            <button onclick="addToCart(${product.id})" class="p-2 md:p-3 bg-white/10 hover:bg-red-600 rounded-xl md:rounded-2xl transition-all group">
                                <i data-lucide="plus" class="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform"></i>
                            </button>
                        ` : `
                            <div class="flex items-center gap-2 bg-red-600 rounded-xl md:rounded-2xl p-1 md:p-1.5">
                                <button onclick="decreaseQuantity(${product.id})" class="p-1 hover:bg-white/20 rounded-lg transition-all">
                                    <i data-lucide="minus" class="w-3 h-3 md:w-4 md:h-4 text-white"></i>
                                </button>
                                <span class="font-bold text-sm md:text-lg min-w-[20px] text-center text-white">${quantity}</span>
                                <button onclick="addToCart(${product.id})" class="p-1 hover:bg-white/20 rounded-lg transition-all">
                                    <i data-lucide="plus" class="w-3 h-3 md:w-4 md:h-4 text-white"></i>
                                </button>
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
    
    if (!isUpdate) {
        initScrollReveal();
    }
    
    ScrollTrigger.refresh();
}

// Separate Scroll Reveal Logic
function initScrollReveal() {
    gsap.utils.toArray('.scroll-reveal').forEach(element => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
}

// Category Filtering
function initCategoryFiltering() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('bg-red-600', 'active');
                b.classList.add('bg-white/5');
            });
            btn.classList.add('bg-red-600', 'active');
            btn.classList.remove('bg-white/5');
            
            const category = btn.innerText;
            
            gsap.to(productsGrid, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                onComplete: () => {
                    renderProducts(category);
                    gsap.to(productsGrid, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3
                    });
                }
            });
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    renderProducts(document.querySelector('.category-btn.active').innerText, true);
    
    gsap.to(cartBtn, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
}

function decreaseQuantity(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    
    updateCartUI();
    renderProducts(document.querySelector('.category-btn.active').innerText, true);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    renderProducts(document.querySelector('.category-btn.active').innerText, true);
}

function updateCartUI() {
    cartCountElement.innerText = cart.reduce((total, item) => total + item.quantity, 0);
    const orderDetailsSection = document.getElementById('order-details-section');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-10">السلة فارغة حالياً</p>';
        if (orderDetailsSection) orderDetailsSection.classList.add('hidden');
    } else {
        if (orderDetailsSection) orderDetailsSection.classList.remove('hidden');
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover">
                <div class="flex-grow">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <p class="text-red-500 font-black text-sm">${item.price} ج.م</p>
                    
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="decreaseQuantity(${item.id})" class="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-red-600 rounded-lg transition-all">
                            <i data-lucide="minus" class="w-3 h-3"></i>
                        </button>
                        <span class="font-bold">${item.quantity}</span>
                        <button onclick="addToCart(${item.id})" class="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-red-600 rounded-lg transition-all">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-gray-500 hover:text-red-500 p-2">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.innerText = `${total.toFixed(2)} ج.م`;
}

function openCartSidebar() {
    cartSidebar.classList.remove('-translate-x-full');
}

function closeCartSidebar() {
    cartSidebar.classList.add('-translate-x-full');
}

// Splash Screen Animation
function initSplashScreen() {
    const tl = gsap.timeline({
        onComplete: () => {
            gsap.to("#loader", {
                opacity: 0,
                duration: 0.8,
                delay: 0.5,
                onComplete: () => {
                    document.getElementById('loader').style.display = 'none';
                    initAnimations(); // Start main hero animations after splash
                }
            });
        }
    });

    tl.to("#splash-logo", {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "back.out(1.7)"
    })
    .to(".splash-char", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    }, "-=0.5")
    .to("#splash-line", {
        width: "100%",
        duration: 0.8,
        ease: "power4.inOut"
    }, "-=0.3")
    .to("#splash-logo", {
        filter: "drop-shadow(0 0 30px rgba(255, 36, 0, 0.8))",
        duration: 0.5,
        yoyo: true,
        repeat: 1
    });
}

// GSAP Animations
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations
    const tl = gsap.timeline();
    tl.to("#hero-bg-text", { opacity: 1, duration: 2, ease: "power2.out" })
      .to("#hero-logo", { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.7)" }, "-=1.5")
      .to("#hero-title", { opacity: 1, y: 0, duration: 1 }, "-=0.8")
      .to("#hero-subtitle", { opacity: 1, y: 0, duration: 1 }, "-=0.8")
      .to("#hero-btns", { opacity: 1, y: 0, duration: 1 }, "-=0.8");

    // Scroll Reveal - using helper function to avoid duplication
    initScrollReveal();
}

async function checkout() {
    if (cart.length === 0) return;
    
    const tableSelect = document.getElementById('table-number');
    const tableNumber = tableSelect ? tableSelect.value : '';
    const orderNote = document.getElementById('order-note')?.value || '';

    if (!tableNumber) {
        alert('يرجى اختيار رقم الطاولة قبل تأكيد الطلب');
        tableSelect.focus();
        return;
    }

    // 1. Fetch current ingredients stock for validation
    const { data: ingredients, error: ingError } = await supabaseClient.from('ingredients').select('*');
    if (ingError) {
        alert('حدث خطأ في الاتصال بقاعدة البيانات');
        return;
    }

    // 2. Validate availability (Products and Ingredients)
    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (!product) continue;

        // Check product stock if tracked
        if (product.is_inventory_tracked && product.stock_quantity < item.quantity) {
            alert(`عذراً، "${item.name}" غير متوفر بالكمية المطلوبة.`);
            return;
        }

        // Check ingredients stock if recipe exists
        if (product.product_recipes && product.product_recipes.length > 0) {
            for (const recipeItem of product.product_recipes) {
                const ingredient = ingredients.find(ing => ing.id === recipeItem.ingredient_id);
                const totalNeeded = recipeItem.quantity_needed * item.quantity;
                if (ingredient && ingredient.stock_quantity < totalNeeded) {
                    alert(`عذراً، المكونات الخام لـ "${item.name}" غير كافية حالياً.`);
                    return;
                }
            }
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = {
        items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        total: total,
        table_number: tableNumber,
        note: orderNote,
        status: 'pending'
    };

    // 3. Save order
    const { data: orderData, error: orderError } = await supabaseClient.from('orders').insert([newOrder]).select();
    if (orderError) {
        alert('خطأ في إرسال الطلب');
        return;
    }

    // 4. Deduct Stock
    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        
        // Deduct Product Stock
        if (product.is_inventory_tracked) {
            await supabaseClient.from('products').update({ stock_quantity: product.stock_quantity - item.quantity }).eq('id', item.id);
        }

        // Deduct Ingredients Stock
        if (product.product_recipes && product.product_recipes.length > 0) {
            for (const recipeItem of product.product_recipes) {
                const ingredient = ingredients.find(ing => ing.id === recipeItem.ingredient_id);
                if (ingredient) {
                    const newQty = ingredient.stock_quantity - (recipeItem.quantity_needed * item.quantity);
                    await supabaseClient.from('ingredients').update({ stock_quantity: newQty }).eq('id', ingredient.id);
                }
            }
        }
    }

    // Success UI updates
    cart = [];
    if (tableSelect) tableSelect.value = '';
    document.getElementById('order-note').value = '';
    updateCartUI();
    renderProducts(document.querySelector('.category-btn.active')?.innerText || 'الكل', true);
    closeCartSidebar();

    const btn = document.getElementById('checkout-btn');
    const originalText = btn.innerText;
    btn.innerText = "تم الإرسال بنجاح!";
    btn.style.backgroundColor = "#22c55e";
    setTimeout(() => {
        document.getElementById('success-modal').classList.remove('hidden');
        lucide.createIcons();
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }, 800);
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// Event Listeners
cartBtn.addEventListener('click', openCartSidebar);
closeCart.addEventListener('click', closeCartSidebar);
document.getElementById('checkout-btn').addEventListener('click', checkout);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    initCategoryFiltering();
    
    // Start splash screen when window is ready
    window.addEventListener('load', () => {
        initSplashScreen();
    });
});
