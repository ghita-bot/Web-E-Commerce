// Global variables
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProductDetail = null;
let deliveryPrice = 5.99; // Default delivery price
let paymentMethod = 'transfer'; // Default payment method

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupEventListeners();
    loadUserProfile();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchProducts(e.target.value);
    });

    // Cart hover
    const cartBtn = document.getElementById('cartBtn');
    const cartHover = document.getElementById('cartHover');
    
    cartBtn.addEventListener('mouseenter', showCartHover);
    cartBtn.addEventListener('mouseleave', hideCartHover);
    cartHover.addEventListener('mouseenter', showCartHover);
    cartHover.addEventListener('mouseleave', hideCartHover);

    // Profile button
    document.getElementById('profileBtn').addEventListener('click', function() {
        document.getElementById('profileModal').classList.remove('hidden');
    });

    // View cart button
    document.getElementById('viewCartBtn').addEventListener('click', function() {
        hideCartHover();
        showCartModal();
    });

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        showCheckout();
    });

    // Payment method selection
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            paymentMethod = this.value;
        });
    });
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('https://fakestoreapi.in/api/products');
        const data = await response.json();
        allProducts = data.products || [];
        
        // Add realistic ratings to products that don't have them
        allProducts = allProducts.map(product => {
            if (!product.rating) {
                const randomRate = (Math.random() * 1 + 4).toFixed(1);
                const randomCount = Math.floor(Math.random() * 100) + 10;
                return {
                    ...product,
                    rating: {
                        rate: parseFloat(randomRate),
                        count: randomCount
                    }
                };
            }
            return product;
        });
        
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('productsGrid').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('loading').innerHTML = '<p class="text-red-600">Failed to load products</p>';
    }
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (products.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    grid.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 p-4 cursor-pointer" onclick="showProductDetail(${product.id})">
            <div class="zoom-disabled relative">
                <img src="${product.image}" alt="${product.title}" class="product-image mb-4 rounded-lg">
                <div class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">${product.category}</div>
            </div>
            <div class="space-y-2">
                <h3 class="font-semibold text-gray-800 line-clamp-2">${product.title}</h3>
                <p class="text-gray-600 text-sm line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-blue-600">$${product.price.toFixed(2)}</span>
                    <div class="flex items-center space-x-1">
                        ${renderRatingStars(product.rating.rate)}
                        <span class="text-sm text-gray-600">(${product.rating.count})</span>
                    </div>
                </div>
                <div class="mt-3" onclick="event.stopPropagation()">
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" class="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <i class="fas fa-cart-plus mr-1"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render rating stars
function renderRatingStars(rating) {
    return `
        <div class="rating-stars">
            <div class="stars-empty">
                ${'<i class="fas fa-star"></i>'.repeat(5)}
            </div>
            <div class="stars-filled" style="width: ${(rating / 5) * 100}%">
                ${'<i class="fas fa-star"></i>'.repeat(5)}
            </div>
        </div>
    `;
}

// Filter by category
function filterByCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (category === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.category.toLowerCase().includes(category.toLowerCase())
        );
    }
    displayProducts(filteredProducts);
}

// Search products
function searchProducts(query) {
    if (!query.trim()) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    displayProducts(filteredProducts);
}

// Add to cart
function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity,
            selected: true
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartHover();
    showNotification(`${product.title} added to cart successfully!`);
}

// Show product detail
function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    currentProductDetail = product;

    const content = `
        <div class="grid md:grid-cols-2 gap-8">
            <div class="zoom-disabled">
                <img src="${product.image}" alt="${product.title}" class="w-full h-96 object-contain bg-gray-50 rounded-lg">
            </div>
            <div class="space-y-4">
                <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">${product.category}</span>
                <h1 class="text-2xl font-bold text-gray-800">${product.title}</h1>
                <div class="flex items-center space-x-2">
                    ${renderRatingStars(product.rating.rate)}
                    <span class="text-gray-600">(${product.rating.count} reviews)</span>
                </div>
                <p class="text-3xl font-bold text-blue-600">$${product.price.toFixed(2)}</p>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold mb-2">Product Description</h3>
                    <p class="text-gray-700 leading-relaxed">${product.description}</p>
                </div>
                
                <!-- Quantity Selector -->
                <div class="flex items-center space-x-4">
                    <div class="quantity-control">
                        <span class="quantity-btn" onclick="event.stopPropagation(); updateProductQuantity(-1)">-</span>
                        <input type="text" id="productQuantity" value="1" class="quantity-input" readonly>
                        <span class="quantity-btn" onclick="event.stopPropagation(); updateProductQuantity(1)">+</span>
                    </div>
                    <span class="text-lg font-semibold" id="productTotalPrice">$${product.price.toFixed(2)}</span>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="event.stopPropagation(); addToCart(${product.id}, parseInt(document.getElementById('productQuantity').value))" 
                            class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        <i class="fas fa-cart-plus mr-2"></i> Add to Cart
                    </button>
                    <button onclick="event.stopPropagation(); checkoutDirectly(${product.id})" 
                            class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        <i class="fas fa-bolt mr-2"></i> Buy Now
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('productDetailContent').innerHTML = content;
    document.getElementById('productModal').classList.remove('hidden');
}

// Checkout directly from product detail
function checkoutDirectly(productId) {
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    closeModal('productModal');
    showCheckout([{...product, quantity: quantity, selected: true}], true);
}

// Update product quantity in detail view
function updateProductQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value) + change;
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    quantityInput.value = quantity;
    
    const totalPrice = (currentProductDetail.price * quantity).toFixed(2);
    document.getElementById('productTotalPrice').textContent = `$${totalPrice}`;
}

// Cart hover functions
function showCartHover() {
    updateCartHover();
    document.getElementById('cartHover').classList.add('show');
}

function hideCartHover() {
    setTimeout(() => {
        if (!document.getElementById('cartHover').matches(':hover') && 
            !document.getElementById('cartBtn').matches(':hover')) {
            document.getElementById('cartHover').classList.remove('show');
        }
    }, 100);
}

// Update cart hover content
function updateCartHover() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        return;
    }

    cartItems.innerHTML = cart.slice(0, 3).map(item => `
        <div class="flex items-center space-x-3 py-2">
            <img src="${item.image}" alt="${item.title}" class="w-12 h-12 object-contain bg-gray-50 rounded">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">${item.title}</p>
                <p class="text-sm text-gray-600">${item.quantity}x $${item.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('') + (cart.length > 3 ? `<p class="text-sm text-gray-500 text-center pt-2">+${cart.length - 3} more items</p>` : '');
}

// Show cart modal
function showCartModal() {
    updateCartModal();
    document.getElementById('cartModal').classList.remove('hidden');
}

// Update cart modal
function updateCartModal() {
    const content = document.getElementById('cartModalContent');
    
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">Your shopping cart is empty</p>
            </div>
        `;
        document.getElementById('cartTotal').textContent = '$0.00';
        return;
    }

    content.innerHTML = `
        <div class="space-y-4">
            ${cart.map(item => `
                <div class="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <input type="checkbox" ${item.selected ? 'checked' : ''} 
                        onchange="toggleCartItem(${item.id})" 
                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                    <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain bg-gray-50 rounded">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${item.title}</h4>
                        <p class="text-sm text-gray-600">${item.category}</p>
                        <p class="text-lg font-semibold text-blue-600">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); updateQuantity(${item.id}, ${item.quantity - 1})" 
                                class="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100">-</button>
                        <span class="w-8 text-center">${item.quantity}</span>
                        <button onclick="event.stopPropagation(); updateQuantity(${item.id}, ${item.quantity + 1})" 
                                class="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100">+</button>
                    </div>
                    <button onclick="event.stopPropagation(); removeFromCart(${item.id})" 
                            class="text-red-500 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    updateCartTotal();
}

// Toggle cart item selection
function toggleCartItem(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.selected = !item.selected;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCheckoutTotals();
    }
}

// Update quantity in cart
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal();
        updateCartCount();
        updateCartHover();
        updateCheckoutTotals();
    }
}

// Update quantity in direct checkout
function updateDirectCheckoutQuantity(button, productId, newQuantity) {
    if (newQuantity < 1) return;
    
    const quantityDisplay = button.parentElement.querySelector('span');
    quantityDisplay.textContent = newQuantity;
    
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const subtotal = Array.from(document.querySelectorAll('.checkout-item')).reduce((sum, item) => {
            const quantity = parseInt(item.querySelector('span').textContent);
            const price = parseFloat(item.querySelector('.font-semibold').textContent.replace('$', '')) / quantity;
            return sum + (price * quantity);
        }, 0);
        
        document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        const total = subtotal + deliveryPrice;
        document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
    }
}

// Update delivery method
function updateCheckoutDelivery(methodId, price) {
    deliveryPrice = price;
    const subtotal = parseFloat(document.getElementById('checkoutSubtotal').textContent.replace('$', ''));
    const total = subtotal + deliveryPrice;
    
    document.getElementById('checkoutShipping').textContent = `$${deliveryPrice.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
    updateCartCount();
    updateCartHover();
    showNotification('Product removed from cart!', 'bg-red-500');
}

// Update cart total
function updateCartTotal() {
    const total = cart
        .filter(item => item.selected)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Function to update all checkout totals
function updateCheckoutTotals() {
    const selectedItems = cart.filter(item => item.selected);
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryPrice;
    
    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = `$${deliveryPrice.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('finalTotal').textContent = `$${total.toFixed(2)}`;
}

// Show checkout (works for both cart and direct checkout)
function showCheckout(items = null, isDirectCheckout = false) {
    const checkoutItems = items || cart;
    const selectedItems = isDirectCheckout ? checkoutItems : checkoutItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        showNotification('Please select at least one product to checkout!', 'bg-red-500');
        return;
    }

    // Delivery options
    const deliveryOptions = [
        { id: 'standard', name: 'Standard Delivery', price: 5.99, days: '3-5 business days' },
        { id: 'express', name: 'Express Delivery', price: 12.99, days: '1-2 business days' },
        { id: 'next-day', name: 'Next Day Delivery', price: 19.99, days: 'Next business day' }
    ];

    // Calculate totals
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryOptions[0].price;
    deliveryPrice = deliveryOptions[0].price;

    // Build items list HTML
    const itemsHtml = selectedItems.map(item => `
        <div class="flex items-center p-3 bg-white rounded-lg checkout-item">
            <img src="${item.image}" alt="${item.title}" class="w-12 h-12 object-contain">
            <div class="ml-3 flex-1">
                <h4 class="font-medium text-sm">${item.title}</h4>
                <div class="flex justify-between text-sm text-gray-600">
                    <span>${item.quantity}x $${item.price.toFixed(2)}</span>
                    <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
            ${isDirectCheckout ? `
            <div class="flex items-center space-x-2 ml-3">
                <button onclick="event.stopPropagation(); updateDirectCheckoutQuantity(this, ${item.id}, ${item.quantity - 1})" 
                
                <button onclick="event.stopPropagation(); updateDirectCheckoutQuantity(this, ${item.id})" 
            </div>
            ` : ''}
        </div>
    `).join('');

    // Build checkout content
    const content = `
        <div class="space-y-6">
            <!-- Order Summary Section -->
            <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-lg mb-3 flex items-center">
                    <i class="fas fa-receipt mr-2 text-blue-600"></i>
                    Order Summary
                </h3>
                <div class="space-y-3 max-h-60 overflow-y-auto">
                    ${itemsHtml}
                </div>
                <div class="border-t pt-3 mt-3 space-y-2">
                    <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span id="checkoutSubtotal" class="font-semibold">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Shipping:</span>
                        <span id="checkoutShipping" class="font-semibold">$${deliveryPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <!-- Delivery Options Section -->
            <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-lg mb-3 flex items-center">
                    <i class="fas fa-truck mr-2 text-blue-600"></i>
                    Delivery Options
                </h3>
                <div class="space-y-2">
                    ${deliveryOptions.map(option => `
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                            <input type="radio" name="delivery" value="${option.id}" 
                                onchange="updateCheckoutDelivery('${option.id}', ${option.price})" 
                                class="h-5 w-5 text-blue-600 focus:ring-blue-500" ${option.id === 'standard' ? 'checked' : ''}>
                            <div class="ml-3 flex-1">
                                <div class="flex justify-between">
                                    <span class="font-medium">${option.name}</span>
                                    <span class="font-semibold">$${option.price.toFixed(2)}</span>
                                </div>
                                <p class="text-sm text-gray-600">${option.days}</p>
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- Payment Method Section -->
            <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-lg mb-3 flex items-center">
                    <i class="fas fa-credit-card mr-2 text-blue-600"></i>
                    Payment Method
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="transfer" checked class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-university text-xl text-blue-600 mr-3"></i>
                            <span>Bank Transfer</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="ewallet" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-wallet text-xl text-green-600 mr-3"></i>
                            <span>E-Wallet</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="credit" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="far fa-credit-card text-xl text-purple-600 mr-3"></i>
                            <span>Credit Card</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="cod" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-money-bill-wave text-xl text-yellow-600 mr-3"></i>
                            <span>Cash on Delivery</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Shipping Address Section -->
            <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-lg mb-3 flex items-center">
                    <i class="fas fa-map-marker-alt mr-2 text-blue-600"></i>
                    Shipping Address
                </h3>
                <textarea id="shippingAddress" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Enter your full address..."></textarea>
            </div>
            
            <!-- Order Notes Section -->
            <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-lg mb-3 flex items-center">
                    <i class="fas fa-edit mr-2 text-blue-600"></i>
                    Order Notes (Optional)
                </h3>
                <textarea id="orderNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Any notes for your order..."></textarea>
            </div>
        </div>
    `;

    document.getElementById('checkoutContent').innerHTML = content;
    
    // Load user address if available
    const userAddress = localStorage.getItem('userAddress') || '';
    document.getElementById('shippingAddress').value = userAddress;
    
    document.getElementById('checkoutModal').classList.remove('hidden');
}

// Process checkout
function processCheckout() {
    const shippingAddress = document.getElementById('shippingAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const deliveryMethod = selectedDelivery ? selectedDelivery.value : 'standard';
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!shippingAddress.trim()) {
        showNotification('Shipping address is required!', 'bg-red-500');
        return;
    }

    // Get selected items (either from cart or direct checkout)
    const selectedItems = document.querySelectorAll('.checkout-item');
    if (selectedItems.length === 0) {
        showNotification('No items selected for checkout!', 'bg-red-500');
        return;
    }

    // Calculate totals
    const subtotal = Array.from(selectedItems).reduce((sum, item) => {
        const priceText = item.querySelector('.font-semibold').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        return sum + price;
    }, 0);
    
    const total = subtotal + deliveryPrice;
    
    // Create order
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const orderItems = Array.from(selectedItems).map(item => {
        const quantity = parseInt(item.querySelector('span').textContent);
        const priceText = item.querySelector('.font-semibold').textContent;
        const price = parseFloat(priceText.replace('$', '')) / quantity;
        const title = item.querySelector('h4').textContent;
        const product = allProducts.find(p => p.title === title) || {};
        
        return {
            ...product,
            quantity: quantity,
            price: price
        };
    });
    
    orders.push({
        id: orderId,
        items: orderItems,
        subtotal: subtotal,
        deliveryMethod: deliveryMethod,
        deliveryPrice: deliveryPrice,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        notes: orderNotes,
        date: new Date().toISOString(),
        total: total,
        status: 'pending'
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // For direct checkout, don't modify cart
    // For cart checkout, remove selected items
    const isDirectCheckout = document.querySelector('.checkout-item button') !== null;
    if (!isDirectCheckout) {
        cart = cart.filter(item => !item.selected);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    closeModal('checkoutModal');
    updateCartCount();
    updateCartHover();
    updateCartModal();
    
    // Show success message
    showOrderSuccess(orderId, total, orderItems.length);
}

// Show order success modal
function showOrderSuccess(orderId, total, itemCount) {
    const content = `
        <div class="text-center p-6">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-4xl text-green-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h3>
            <p class="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Order ID:</span>
                    <span class="font-medium">${orderId}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Items:</span>
                    <span class="font-medium">${itemCount} ${itemCount > 1 ? 'items' : 'item'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-medium">$${total.toFixed(2)}</span>
                </div>
            </div>
            
            <p class="text-sm text-gray-500 mb-6">We've sent the order confirmation to your email. You can track your order in your account.</p>
            
            <div class="flex space-x-3">
                <button onclick="closeModal('successModal')" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('successModal').querySelector('.rounded-xl').innerHTML = content;
    document.getElementById('successModal').classList.remove('hidden');
}

// Rest of the functions (loadUserProfile, saveProfile, logout, etc.) remain the same
// ... [Previous functions remain unchanged]

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Show notification
function showNotification(message, bgColor = 'bg-green-500') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notification.className = `notification fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notificationText.textContent = message;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
        const modals = ['profileModal', 'cartModal', 'productModal', 'checkoutModal', 'successModal'];
        modals.forEach(modalId => {
            if (!document.getElementById(modalId).classList.contains('hidden')) {
                closeModal(modalId);
            }
        });
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = ['profileModal', 'cartModal', 'productModal', 'checkoutModal', 'successModal'];
        modals.forEach(modalId => {
            if (!document.getElementById(modalId).classList.contains('hidden')) {
                closeModal(modalId);
            }
        });
    }
});