
const API_URL = "https://fakestoreapi.com/products";

let allProducts = [];
let cart = [];
let currentUser = null;
let registeredUsers = [];
let currentCategory = "All";

async function loadProducts() {
    const status = document.getElementById("status");
    const container = document.getElementById("products");

    status.textContent = "Loading products...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not fetch products");
        }

        allProducts = await response.json();
        displayProducts(allProducts);
        status.textContent = "Showing " + allProducts.length + " products";

    } catch (error) {
        status.textContent = "Unable to load products. Check your internet.";

        container.innerHTML = `
            <button class="add-btn" onclick="loadProducts()">
                Try Again
            </button>`;
    }
}

function displayProducts(products) {
    const container = document.getElementById("products");

    if (products.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
        return;
    }

    container.innerHTML = products.map(product => `
        <article class="product-card">
            <img src="${product.image}" alt="Product image"
                 onerror="this.style.display='none'">

            <h3>${product.title}</h3>

            <p class="price">
                ₹${(product.price * 85).toLocaleString("en-IN", {
                    maximumFractionDigits: 0
                })}
            </p>

            <p class="category">Category: ${product.category}</p>

            <button class="add-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </article>
    `).join("");
}

function applyFilters() {
    const query = document.getElementById("search").value.toLowerCase();

    let result = allProducts.filter(product => {
        const matchesCategory =
            currentCategory === "All" ||
            product.category === currentCategory;

        const matchesSearch =
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    const sort = document.getElementById("sort").value;

    if (sort === "low") {
        result.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    displayProducts(result);

    document.getElementById("status").textContent =
        "Showing " + result.length + " products";
}

function filterCategory(category) {
    currentCategory = category;
    applyFilters();
}

function sortProducts() {
    applyFilters();
}

document.getElementById("search").addEventListener("input", applyFilters);

function openModal(id) {
    closeModals();
    document.getElementById(id).classList.add("active");
    document.getElementById("dropdown").classList.remove("show");
}

function closeModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
    });
}

function switchModal(from, to) {
    document.getElementById(from).classList.remove("active");
    document.getElementById(to).classList.add("active");
}

function toggleMenu() {
    document.getElementById("dropdown").classList.toggle("show");
}

function signupUser(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    if (registeredUsers.some(user => user.email === email)) {
        document.getElementById("signupMessage").textContent =
            "This email is already registered.";
        return;
    }

    registeredUsers.push({ name, email, password });

    currentUser = { name, email };

    document.getElementById("signupMessage").textContent =
        "Account created successfully!";

    updateProfile();
    document.getElementById("signupPassword").value = "";

    setTimeout(closeModals, 700);
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const user = registeredUsers.find(item =>
        item.email === email && item.password === password
    );

    if (!user) {
        document.getElementById("loginMessage").textContent =
            "Account not found. Please sign up first.";
        return;
    }

    currentUser = { name: user.name, email: user.email };

    document.getElementById("loginMessage").textContent =
        "Login successful!";

    updateProfile();
    document.getElementById("loginPassword").value = "";

    setTimeout(closeModals, 700);
}

function updateProfile() {
    document.getElementById("profileName").textContent =
        currentUser ? currentUser.name : "Guest User";

    document.getElementById("profileEmail").textContent =
        currentUser ? currentUser.email : "Not logged in";
}

function showProfile() {
    toggleCloseMenu();
    updateProfile();
    openModal("profileModal");
}

function toggleCloseMenu() {
    document.getElementById("dropdown").classList.remove("show");
}

function showOrders() {
    toggleCloseMenu();

    document.getElementById("ordersMessage").textContent =
        "No orders placed yet. Your future orders will appear here.";

    openModal("ordersModal");
}

function logout() {
    currentUser = null;
    updateProfile();
    toggleCloseMenu();
    alert("You have been logged out of this demo.");
}

function changeTheme() {
    const theme = document.getElementById("themeSelect").value;
    document.body.classList.toggle("dark", theme === "dark");
}

function changeFont() {
    const size = document.getElementById("fontSelect").value;
    document.body.style.fontSize = size + "px";
}

function addToCart(id) {
    const product = allProducts.find(item => item.id === id);

    if (!product) return;

    cart.push(product);
    document.getElementById("cartCount").textContent = cart.length;
}

function showCart() {
    const container = document.getElementById("cartItems");

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty!</p>";
    } else {
        container.innerHTML = cart.map((product, index) => `
            <div class="cart-row">
                <span>${product.title}</span>
                <span>₹${Math.round(product.price * 85)}</span>
                <button class="remove-btn"
                    onclick="removeFromCart(${index})">Remove</button>
            </div>
        `).join("");
    }

    updateCartTotal();
    openModal("cartModal");
}

function removeFromCart(index) {
    cart.splice(index, 1);

    document.getElementById("cartCount").textContent = cart.length;

    showCart();
}

function updateCartTotal() {
    const total = cart.reduce(
        (sum, product) => sum + product.price * 85, 0
    );

    document.getElementById("cartTotal").textContent =
        "Total: ₹" + Math.round(total).toLocaleString("en-IN");
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Checkout is a demo feature. No real order or payment will be made.");
}

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModals();
    });
});

updateProfile();
loadProducts();
