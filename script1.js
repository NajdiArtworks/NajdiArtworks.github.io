const cartButton = document.querySelector(".cart-button");
const cartPopover = document.querySelector(".cart-popover");
const cartClose = document.querySelector(".cart-close");
const cartItems = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total");
const checkoutButton = document.querySelector(".checkout-button");
const clearButton = document.querySelector(".cart-clear");
const addButtons = document.querySelectorAll("[data-cart-add]");

const storageKey = "najdi-artworks-cart";
const whatsappNumber = "966554674825";
let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function formatPrice(value) {
  return `${value} SAR`;
}

function getCartTotals() {
  return cart.reduce(
    (totals, item) => ({
      quantity: totals.quantity + item.quantity,
      price: totals.price + item.price * item.quantity,
    }),
    { quantity: 0, price: 0 }
  );
}

function getWhatsAppOrderUrl() {
  const totals = getCartTotals();
  const orderLines = cart
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`
    )
    .join("\n");
  const message = `Hello Najdi Artworks, I would like to order:\n\n${orderLines}\n\nTotal: ${formatPrice(
    totals.price
  )}`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function openCart() {
  cartPopover.classList.add("is-open");
  cartPopover.setAttribute("aria-hidden", "false");
  cartButton.setAttribute("aria-expanded", "true");
}

function closeCart() {
  cartPopover.classList.remove("is-open");
  cartPopover.setAttribute("aria-hidden", "true");
  cartButton.setAttribute("aria-expanded", "false");
}

function toggleCart() {
  if (cartPopover.classList.contains("is-open")) {
    closeCart();
  } else {
    openCart();
  }
}

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(name, change) {
  const item = cart.find((entry) => entry.name === name);
  if (!item) return;

  item.quantity += change;
  cart = cart.filter((entry) => entry.quantity > 0);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const totals = getCartTotals();
  cartCount.textContent = totals.quantity;
  cartTotal.textContent = formatPrice(totals.price);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    checkoutButton.setAttribute("aria-disabled", "true");
    checkoutButton.href = `https://wa.me/${whatsappNumber}`;
    return;
  }

  checkoutButton.removeAttribute("aria-disabled");
  checkoutButton.href = getWhatsAppOrderUrl();
  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-line">
          <div>
            <h3>${item.name}</h3>
            <p>${formatPrice(item.price)} each</p>
          </div>
          <div class="cart-line-controls" aria-label="${item.name} quantity controls">
            <button class="quantity-button" type="button" data-cart-decrease="${item.name}" aria-label="Remove one ${item.name}">-</button>
            <span class="cart-quantity">${item.quantity}</span>
            <button class="quantity-button" type="button" data-cart-increase="${item.name}" aria-label="Add one ${item.name}">+</button>
          </div>
        </article>
      `
    )
    .join("");
}

addButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    addToCart(button.dataset.name, Number(button.dataset.price));
  });
});

cartButton.addEventListener("click", toggleCart);
cartClose.addEventListener("click", closeCart);
clearButton.addEventListener("click", clearCart);

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-cart-increase]");
  const decrease = event.target.closest("[data-cart-decrease]");

  if (increase) updateQuantity(increase.dataset.cartIncrease, 1);
  if (decrease) updateQuantity(decrease.dataset.cartDecrease, -1);
});

checkoutButton.addEventListener("click", (event) => {
  if (cart.length === 0) {
    event.preventDefault();
    return;
  }

  checkoutButton.href = getWhatsAppOrderUrl();
  closeCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

document.addEventListener("click", (event) => {
  const clickedCart = cartPopover.contains(event.target) || cartButton.contains(event.target);
  if (!clickedCart) closeCart();
});

renderCart();
