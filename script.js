// ===== Settings: change these for each restaurant =====
const WHATSAPP_NUMBER = "254757805430"; // country code + number, no + sign, no spaces
const DELIVERY_FEE = 150;

// ===== Menu data: add, remove or edit dishes here =====
const menu = [
  {
    section: "Mains",
    items: [
      { id: "m1", name: "Pilau with kachumbari", desc: "Spiced rice with beef, and a fresh tomato and onion salad.", price: 450 },
      { id: "m2", name: "Chicken stew with chapati", desc: "Slow-cooked chicken in a rich tomato gravy, with two soft chapatis.", price: 500 },
      { id: "m3", name: "Ugali with beef stew", desc: "Firm ugali with tender beef in its own broth.", price: 450 },
      { id: "m4", name: "Fried tilapia with ugali", desc: "Whole tilapia, fried crisp, served with ugali and kachumbari.", price: 700 }
    ]
  },
  {
    section: "Sides",
    items: [
      { id: "s1", name: "Chapati (2 pieces)", desc: "Soft, layered and hot off the pan.", price: 100 },
      { id: "s2", name: "Sukuma wiki", desc: "Collard greens sautéed with onion and tomato.", price: 120 },
      { id: "s3", name: "Chips", desc: "Hand-cut potato chips.", price: 200 }
    ]
  },
  {
    section: "Drinks",
    items: [
      { id: "d1", name: "Fresh passion juice", desc: "Pressed to order, 400 ml.", price: 150 },
      { id: "d2", name: "Soda", desc: "300 ml bottle.", price: 80 },
      { id: "d3", name: "Spiced tea (chai)", desc: "Made with milk, ginger and cardamom.", price: 80 }
    ]
  }
];

// ===== Helpers =====
const money = (n) => "Sh. " + n.toLocaleString("en-KE");
const allItems = menu.flatMap((group) => group.items);
const findItem = (id) => allItems.find((item) => item.id === id);
const isDelivery = () => document.querySelector('input[name="type"]:checked').value === "Delivery";

// The cart stores how many of each dish: { m1: 2, d1: 1 } means 2 of m1 and 1 of d1
let cart = {};

function cartTotal() {
  let total = 0;
  for (const id in cart) {
    total += findItem(id).price * cart[id];
  }
  if (isDelivery() && total > 0) {
    total += DELIVERY_FEE;
  }
  return total;
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

// ===== Draw the menu on the page =====
function renderMenu() {
  const html = menu.map((group) => `
    <h2>${group.section}</h2>
    ${group.items.map((item) => `
      <article class="item">
        <div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>
        <div class="buy">
          <span class="price">${money(item.price)}</span>
          <button class="add" data-id="${item.id}" aria-label="Add ${item.name} to your order">Add</button>
        </div>
      </article>
    `).join("")}
  `).join("");
  document.getElementById("menu").innerHTML = html;
}

// ===== Draw the cart and total =====
function renderCart() {
  const ids = Object.keys(cart);
  const list = document.getElementById("cart-items");

  if (ids.length === 0) {
    list.innerHTML = '<li class="empty">Your order is empty. Tap Add on any dish.</li>';
  } else {
    list.innerHTML = ids.map((id) => {
      const item = findItem(id);
      return `
        <li>
          <span>${item.name}</span>
          <span class="qty">
            <button data-id="${id}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
            ${cart[id]}
            <button data-id="${id}" data-change="1" aria-label="Add one ${item.name}">+</button>
          </span>
          <span>${money(item.price * cart[id])}</span>
        </li>`;
    }).join("");
  }

  const total = cartTotal();
  document.getElementById("total").textContent = money(total);
  document.getElementById("cart-bar").textContent = "View order: " + money(total);
  document.getElementById("fee-note").hidden = !(isDelivery() && total > 0);
}

// ===== Change the quantity of a dish =====
function changeQty(id, change) {
  cart[id] = (cart[id] || 0) + change;
  if (cart[id] <= 0) {
    delete cart[id];
  }
  renderCart();
}

// ===== Clicks =====
document.getElementById("menu").addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (button) {
    changeQty(button.dataset.id, 1);
  }
});

document.getElementById("cart-items").addEventListener("click", (event) => {
  const button = event.target.closest("[data-change]");
  if (button) {
    changeQty(button.dataset.id, Number(button.dataset.change));
  }
});

document.querySelectorAll('input[name="type"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.getElementById("address-row").hidden = !isDelivery();
    renderCart();
  });
});

// ===== Send the order to the restaurant on WhatsApp =====
document.getElementById("send").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (Object.keys(cart).length === 0) {
    showMessage("Add at least one dish to your order.");
    return;
  }
  if (name === "" || phone === "") {
    showMessage("Enter your name and phone number.");
    return;
  }
  if (isDelivery() && address === "") {
    showMessage("Enter your delivery address.");
    return;
  }

  const lines = Object.keys(cart).map((id) => {
    const item = findItem(id);
    return `${cart[id]} × ${item.name} (${money(item.price * cart[id])})`;
  });

  const text = [
    `New order from ${name} (${phone})`,
    `Type: ${isDelivery() ? "Delivery" : "Pickup"}`,
    ...(isDelivery() ? [`Address: ${address}`] : []),
    "",
    ...lines,
    ...(isDelivery() ? [`Delivery fee: ${money(DELIVERY_FEE)}`] : []),
    `Total: ${money(cartTotal())}`
  ].join("\n");

  showMessage("");
  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
});

// ===== Start =====
renderMenu();
renderCart();
