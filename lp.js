        // Modal functionality
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const cartBtn = document.getElementById('cart-btn');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        const searchInput = document.getElementById('search-input');

        // Function to show login modal
        function showLoginModal() {
            loginModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        // Event listeners for elements that require login
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });

        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });

        searchInput.addEventListener('focus', (e) => {
            e.preventDefault();
            showLoginModal();
        });

        closeLogin.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        closeRegister.addEventListener('click', () => {
            registerModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        switchToRegister.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });

        switchToLogin.addEventListener('click', () => {
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
            if (e.target === registerModal) {
                registerModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });

       // Toggle password visibility for all password fields
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        // Find the closest password wrapper and then the input inside it
        const passwordWrapper = this.closest('.password-wrapper');
        const passwordInput = passwordWrapper.querySelector('input[type="password"], input[type="text"]');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

        // Form validation for login
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Validate email
            const email = document.getElementById('login-email');
            const emailError = document.getElementById('login-email-error');
            if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                email.classList.add('input-error');
                emailError.classList.remove('hidden');
                isValid = false;
            } else {
                email.classList.remove('input-error');
                emailError.classList.add('hidden');
            }
            
            // Validate password
            const password = document.getElementById('login-password');
            const passwordError = document.getElementById('login-password-error');
            if (!password.value) {
                password.classList.add('input-error');
                passwordError.classList.remove('hidden');
                isValid = false;
            } else {
                password.classList.remove('input-error');
                passwordError.classList.add('hidden');
            }
            
            if (isValid) {
                // Submit form or redirect
                window.location.href = 'homepage.html';
            }
        });

        // Form validation for register
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Validate first name
            const firstName = document.getElementById('first-name');
            const firstNameError = document.getElementById('first-name-error');
            if (!firstName.value) {
                firstName.classList.add('input-error');
                firstNameError.classList.remove('hidden');
                isValid = false;
            } else {
                firstName.classList.remove('input-error');
                firstNameError.classList.add('hidden');
            }
            
            // Validate last name
            const lastName = document.getElementById('last-name');
            const lastNameError = document.getElementById('last-name-error');
            if (!lastName.value) {
                lastName.classList.add('input-error');
                lastNameError.classList.remove('hidden');
                isValid = false;
            } else {
                lastName.classList.remove('input-error');
                lastNameError.classList.add('hidden');
            }
            
            // Validate email
            const email = document.getElementById('register-email');
            const emailError = document.getElementById('register-email-error');
            if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                email.classList.add('input-error');
                emailError.classList.remove('hidden');
                isValid = false;
            } else {
                email.classList.remove('input-error');
                emailError.classList.add('hidden');
            }
            
            // Validate password
            const password = document.getElementById('register-password');
            const passwordError = document.getElementById('register-password-error');
            if (!password.value || password.value.length < 8) {
                password.classList.add('input-error');
                passwordError.classList.remove('hidden');
                isValid = false;
            } else {
                password.classList.remove('input-error');
                passwordError.classList.add('hidden');
            }
            
            // Validate confirm password
            const confirmPassword = document.getElementById('confirm-password');
            const confirmPasswordError = document.getElementById('confirm-password-error');
            if (password.value !== confirmPassword.value) {
                confirmPassword.classList.add('input-error');
                confirmPasswordError.classList.remove('hidden');
                isValid = false;
            } else {
                confirmPassword.classList.remove('input-error');
                confirmPasswordError.classList.add('hidden');
            }
            
            // Validate terms checkbox
            const terms = document.getElementById('agree-terms');
            const termsError = document.getElementById('terms-error');
            if (!terms.checked) {
                termsError.classList.remove('hidden');
                isValid = false;
            } else {
                termsError.classList.add('hidden');
            }
            
           
        });

        // Fetch products from API
        async function fetchProducts() {
            try {
                const response = await fetch('https://fakestoreapi.in/api/products');
                const data = await response.json();
                displayProducts(data.products.slice(0, 4)); // Show only 4 products
            } catch (error) {
                console.error('Error fetching products:', error);
                // Fallback data if API fails
                const fallbackProducts = [
                    {
                        id: 1,
                        title: "Smartphone X Pro",
                        price: 799,
                        description: "Flagship smartphone with 108MP camera",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Smartphone"
                    },
                    {
                        id: 2,
                        title: "Wireless Headphones",
                        price: 149,
                        description: "Noise-cancelling wireless headphones with 30hr battery life",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Headphones"
                    },
                    {
                        id: 3,
                        title: "4K Ultra HD Smart TV",
                        price: 899,
                        description: "55-inch 4K Smart TV with HDR and streaming apps",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Smart+TV"
                    },
                    {
                        id: 4,
                        title: "Gaming Laptop",
                        price: 1299,
                        description: "High-performance gaming laptop with RTX graphics",
                        category: "electronics",
                        image: "https://via.placeholder.com/300x300?text=Gaming+Laptop"
                    }
                ];
                displayProducts(fallbackProducts);
            }
        }

        function displayProducts(products) {
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '';

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'bg-white rounded-lg shadow overflow-hidden product-card transition duration-300 cursor-pointer';
                productCard.innerHTML = `
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}" class="product-image">
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">${product.title}</h3>
                        <p class="text-gray-600 text-sm mb-2 line-clamp-2">${product.description}</p>
                        <div class="flex items-center justify-between mt-3">
                            <span class="text-lg font-bold text-blue-600">$${product.price}</span>
                            <button class="add-to-cart bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 transition duration-300" data-id="${product.id}">
                                <i class="fas fa-shopping-cart mr-1"></i> Buy
                            </button>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(productCard);
            });

            // Add event listeners to "Add to cart" buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent the product card click event from firing
                    showLoginModal();
                });
            });

            // Add click event to all product cards
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // Don't trigger if clicking on the buy button (it has its own handler)
                    if (!e.target.closest('.add-to-cart')) {
                        e.preventDefault();
                        showLoginModal();
                    }
                });
            });
        }

        // Load products when page loads
        document.addEventListener('DOMContentLoaded', fetchProducts);