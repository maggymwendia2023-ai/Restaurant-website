// ===== Settings: change these for each restaurant =====
const WHATSAPP_NUMBER = "254757805430"; // country code + number, no + sign, no spaces
const DELIVERY_FEE = 150;

// ===== Menu data: add, remove or edit dishes here =====
const menu = [
  {
    section: "Mains",
    items: [
      { id: "m1", name: "Pilau with kachumbari", desc: "Spiced rice with beef, and a fresh tomato and onion salad.", price: 450, img: "images/pilau.jpg.jpg" },
      { id: "m2", name: "Chicken stew with chapati", desc: "Slow-cooked chicken in a rich tomato gravy, with two soft chapatis.", price: 500, img: "images/chicken-stew.jpg.jpg" },
      { id: "m3", name: "Ugali with beef stew", desc: "Firm ugali with tender beef in its own broth.", price: 450, img: "images/ugali.jpg.jpg" },
      { id: "m4", name: "Fried tilapia with ugali", desc: "Whole tilapia, fried crisp, served with ugali and kachumbari.", price: 700, img: "images/tilapia.jpg.jpg" }
    ]
  },
  {
    section: "Sides",
    items: [
      { id: "s1", name: "Chapati (2 pieces)", desc: "Soft, layered and hot off the pan.", price: 100, img: "images/chapati.jpg.jpeg" },
      { id: "s2", name: "Sukuma wiki", desc: "Collard greens sautéed with onion and tomato.", price: 120, img: "images/sukuma-wiki.jpg.jpg" },
      { id: "s3", name: "Chips", desc: "Hand-cut potato chips.", price: 200, img: "images/chips.jpg.jpg" }
    ]
  },
  {
    section: "Drinks",
    items: [
      { id: "d1", name: "Fresh passion juice", desc: "Pressed to order, 400 ml.", price: 150, img: "images/passion-juice.jpg.jpg" },
      { id: "d2", name: "Soda", desc: "300 ml bottle.", price: 80, img: "images/soda.jpg.jpg" },
      { id: "d3", name: "Spiced tea (chai)", desc: "Made with milk, ginger and cardamom.", price: 80, img: "images/chai.jpg.jpg" },
      { id: "d4", name: "Bottled water", desc: "500 ml bottle.", price: 50, img: "images/water.jpg" }
    ]
  },
  {
    section: "Desserts",
    items: [
      { id: "de1", name: "Rice pudding", desc: "Creamy rice cooked with milk and sugar.", price: 150, img: "images/rice-pudding.jpg" },
      { id: "de2", name: "Fruit salad", desc: "A mix of seasonal fruits with a honey dressing.", price: 200, img: "images/fruit- salad.jpg" },
      { id: "de3", name: "Cookies", desc: "Soft and chewy, with a hint of coconut.", price: 100, img: "images/cookies.jpg" },
      { id: "de4", name: "Chocolate cake", desc: "Rich and moist chocolate cake with a ganache topping.", price: 250, img: "images/chocolate.jpg" },
      { id: "de5", name: "Mango sorbet", desc: "Refreshing mango sorbet made from ripe mangoes.", price: 180, img: "images/mango- sorbet.jpg" }
    ]
  }
];

// ===== Helpers =====
// ===== Helpers =====
const money = (n) => "Sh. " + n.toLocaleString("en-KE");
const allItems = menu.flatMap((group) => group.items);
const findItem = (id) => allItems.find((item) => item.id === id);
const isDelivery = () => document.querySelector('input[name="type"]:checked').value === "Delivery";

// Reads the saved cart from the browser, so it survives a page refresh
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("cart"));
    const clean = {};
    for (const id in saved) {
      if (findItem(id) && Number.isInteger(saved[id]) && saved[id] > 0) {
        clean[id] = saved[id];
      }
    }
    return clean;
  } catch (error) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    // storage is blocked, the cart just won't be remembered
  }
}

// The cart stores how many of each dish: { m1: 2, d1: 1 } means 2 of m1 and 1 of d1
let cart = loadCart();

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
  const names = ["All", ...menu.map((group) => group.section)];
  const filtersHtml = `
    <div class="filters">
      ${names.map((name) => `
        <button type="button" data-filter="${name}" aria-pressed="${name === "All"}"
          class="${name === "All" ? "active" : ""}">${name}</button>
      `).join("")}
    </div>`;

  const groupsHtml = menu.map((group) => `
    <div class="group" data-section="${group.section}">
      <h2>${group.section}</h2>
      ${group.items.map((item) => `
        <article class="item">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'">
          <div class="info">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </div>
          <div class="buy">
            <span class="price">${money(item.price)}</span>
            <button class="add" data-id="${item.id}" aria-label="Add ${item.name} to your order">Add</button>
          </div>
        </article>
      `).join("")}
    </div>
  `).join("");

  document.getElementById("menu").innerHTML = filtersHtml + groupsHtml;
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
  saveCart();
  renderCart();
}

const OPEN_HOUR = 10;   // 10:00 am
const CLOSE_HOUR = 21;  // 9:00 pm

function updateOpenStatus() {
  const hour = new Date().getHours();
  const open = hour >= OPEN_HOUR && hour < CLOSE_HOUR;
  const badge = document.getElementById("open-status");
  badge.textContent = open ? "Open now" : "Closed. We open at 10:00 am.";
  badge.className = "status " + (open ? "open" : "closed");
  const contactStatus = document.getElementById("contact-open-status");
  if (contactStatus) {
    contactStatus.textContent = open ? "Currently open" : "Currently closed";
  }
}

// ===== Start the ordering system only on pages that contain it =====
if (document.getElementById("menu") && document.getElementById("cart-items")) {
  document.getElementById("menu").addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      const choice = filterButton.dataset.filter;
      document.querySelectorAll(".group").forEach((group) => {
        group.hidden = !(choice === "All" || group.dataset.section === choice);
      });
      document.querySelectorAll(".filters button").forEach((button) => {
        button.classList.toggle("active", button === filterButton);
        button.setAttribute("aria-pressed", button === filterButton);
      });
      return;
    }

    const addButton = event.target.closest(".add[data-id]");
    if (addButton) {
      changeQty(addButton.dataset.id, 1);
      showMessage("");
    }
  });

  document.getElementById("cart-items").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id][data-change]");
    if (button) {
      changeQty(button.dataset.id, Number(button.dataset.change));
    }
  });

  document.querySelectorAll('input[name="type"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("address-row").hidden = !isDelivery();
      renderCart();
    });
  });

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
    const notes = document.getElementById("notes").value.trim();
    const text = [
      `New order from ${name} (${phone})`,
      `Type: ${isDelivery() ? "Delivery" : "Pickup"}`,
      ...(isDelivery() ? [`Address: ${address}`] : []),
      "",
      ...lines,
      ...(isDelivery() ? [`Delivery fee: ${money(DELIVERY_FEE)}`] : []),
      `Total: ${money(cartTotal())}`,
      ...(notes ? ["", `Notes: ${notes}`] : [])
    ].join("\n");

    showMessage("");
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
  });

  renderMenu();
  renderCart();
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);
}

// ===== Shared navigation and lightweight section reveals =====
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("main-nav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    nav.classList.toggle("open", !expanded);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
      nav.classList.remove("open");
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
}