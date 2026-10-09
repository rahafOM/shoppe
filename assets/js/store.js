(() => {
  'use strict';
  const products = [
    { id: 'lira', name: 'Lira Earrings', price: 20, image: 'Img 01 (2).png', category: '1', sale: true },
    { id: 'hal', name: 'Hal Earrings', price: 25, image: 'Img 02.png', category: '1', sale: false },
    { id: 'kaede', name: 'Kaede Hair Pin Set Of 3', price: 30, image: 'Img 04 (1).png', category: '2', sale: false },
    { id: 'hair', name: 'Hair Pin Set Of 3', price: 30, image: 'Img 04.png', category: '2', sale: false },
    { id: 'plaine', name: 'Plaine Necklace', price: 19, image: 'Img 05.png', category: '3', sale: true },
    { id: 'yuki', name: 'Yuki Hair Pin Set Of 3', price: 29, image: 'Img 07.png', category: '2', sale: false }
  ];
  const money = value => '$' + value.toFixed(2);
  const imagePath = product => './assets/image/' + product.image;
  const url = product => './product.html?id=' + product.id;
  let cart = {};
  try {
    const saved = JSON.parse(localStorage.getItem('shoppe-cart'));
    products.forEach(product => {
      if (Number.isInteger(saved?.[product.id]) && saved[product.id] > 0) cart[product.id] = Math.min(saved[product.id], 99);
    });
  } catch { /* Storage can be unavailable or contain invalid data. */ }
  const status = document.createElement('p');
  status.className = 'store-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  let statusTimer;
  function notify(message) {
    status.textContent = message;
    status.classList.add('visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove('visible'), 5000);
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'cart-dialog';
  dialog.setAttribute('aria-labelledby', 'cart-title');
  dialog.innerHTML = '<button type="button" class="cart-close btn" aria-label="Close cart">×</button><h2 id="cart-title">Your cart</h2><div class="cart-items"></div><p class="cart-total"></p><p>This demo saves your cart on this device. Checkout is not available.</p><a class="btn btn-dark" href="./shop.html">Continue shopping</a>';
  document.body.append(dialog);
  dialog.querySelector('.cart-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  const cartLinks = [];
  function renderCart() {
    const container = dialog.querySelector('.cart-items');
    container.replaceChildren();
    let total = 0;
    let count = 0;
    products.forEach(product => {
      const quantity = cart[product.id];
      if (!quantity) return;
      total += product.price * quantity;
      count += quantity;
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `<img src="${imagePath(product)}" alt=""><div><a href="${url(product)}">${product.name}</a><p>${money(product.price)} × ${quantity}</p></div><button type="button" class="btn btn-outline-dark">Remove</button>`;
      row.querySelector('button').setAttribute('aria-label', 'Remove ' + product.name);
      row.querySelector('button').addEventListener('click', () => { delete cart[product.id]; saveCart(); });
      container.append(row);
    });
    if (!count) container.textContent = 'Your cart is empty.';
    dialog.querySelector('.cart-total').textContent = 'Subtotal: ' + money(total);
    cartLinks.forEach(link => {
      link.setAttribute('aria-label', `Open cart, ${count} items`);
      link.querySelector('.cart-count').textContent = count || '';
    });
  }
  function saveCart() {
    try { localStorage.setItem('shoppe-cart', JSON.stringify(cart)); }
    catch { notify('Cart storage is unavailable; items will last for this page only.'); }
    renderCart();
  }
  function add(product, quantity = 1) {
    cart[product.id] = Math.min(99, (cart[product.id] || 0) + quantity);
    saveCart();
    notify(product.name + ' added to cart.');
  }
  document.querySelectorAll('a:has(img[alt="Cart"])').forEach(link => {
    link.href = '#cart';
    link.innerHTML += '<span class="cart-count" aria-hidden="true"></span>';
    cartLinks.push(link);
    link.addEventListener('click', event => { event.preventDefault(); renderCart(); dialog.showModal(); });
  });
  renderCart();
  document.querySelectorAll('a:has(img[alt="Search"])').forEach(link => { link.href = './shop.html?focus=search'; });
  document.querySelectorAll('.product-card').forEach((card, index) => {
    const product = products[index];
    if (!product) return;
    const image = card.querySelector('img');
    let link = image.closest('a');
    if (!link) { link = document.createElement('a'); image.before(link); link.append(image); }
    link.href = url(product);
    image.alt = product.name;
    card.querySelector('.product-title').textContent = product.name;
    const price = card.querySelector('.product-price') || card.querySelector(':scope > span');
    if (price) price.textContent = money(product.price);
    card.querySelectorAll('button').forEach(button => button.addEventListener('click', () => add(product)));
    card.dataset.product = product.id;
  });
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const search = sidebar.querySelector('input[type="search"]');
    const [category, sort] = sidebar.querySelectorAll('select');
    const range = sidebar.querySelector('input[type="range"]');
    const grid = document.querySelector('.col-md-9 > .row');
    const columns = [...grid.children];
    const empty = document.createElement('p');
    empty.setAttribute('role', 'status');
    empty.textContent = 'No products match your filters.';
    grid.after(empty);
    function filter() {
      let visible = 0;
      columns.forEach((column, index) => {
        const product = products[index];
        const matches = product.name.toLowerCase().includes(search.value.trim().toLowerCase()) &&
          (!category.value || product.category === category.value) && product.price <= Number(range.value) &&
          (!document.getElementById('onSaleSwitch').checked || product.sale);
        column.hidden = !matches;
        if (matches) visible++;
      });
      const ordered = [...columns].sort((a, b) => {
        const ai = columns.indexOf(a), bi = columns.indexOf(b);
        if (sort.value === '1') return products[ai].price - products[bi].price;
        if (sort.value === '2') return products[bi].price - products[ai].price;
        return ai - bi;
      });
      ordered.forEach(column => grid.append(column));
      sidebar.querySelector('output').textContent = 'Maximum price: ' + money(Number(range.value));
      empty.hidden = visible > 0;
    }
    sidebar.querySelectorAll('input, select').forEach(control => control.addEventListener('input', filter));
    filter();
    if (new URLSearchParams(location.search).has('focus')) search.focus();
  }
  const mainImage = document.getElementById('mainImage');
  if (mainImage) {
    const product = products.find(item => item.id === new URLSearchParams(location.search).get('id')) || products[0];
    const details = mainImage.closest('.row').querySelector('.col-md-5:last-child');
    details.querySelector('h3').textContent = product.name;
    details.querySelector('.price').textContent = money(product.price);
    document.title = product.name + ' - Shoppe';
    mainImage.src = imagePath(product);
    mainImage.alt = product.name;
    document.querySelector('.product-images').hidden = true;
    details.querySelector('p:not(.price)').textContent = 'Explore ' + product.name + ' from the Shoppe collection.';
    const quantity = document.getElementById('quantity');
    const clamp = () => quantity.value = Math.max(1, Math.min(99, Math.floor(Number(quantity.value) || 1)));
    quantity.addEventListener('change', clamp);
    window.changeQuantity = amount => { clamp(); quantity.value = Math.max(1, Math.min(99, Number(quantity.value) + amount)); };
    details.querySelector('.btn-dark').addEventListener('click', () => { clamp(); add(product, Number(quantity.value)); });
    const suggestions = products.filter(item => item.id !== product.id).slice(0, 3);
    document.querySelectorAll('.similar-items > div').forEach((item, index) => {
      const similar = suggestions[index];
      const image = item.querySelector('img');
      const link = document.createElement('a');
      link.href = url(similar); image.before(link); link.append(image); image.alt = similar.name; image.src = imagePath(similar);
      item.querySelector('p').textContent = similar.name;
      item.querySelector('.price').textContent = money(similar.price);
    });
  }
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input:not([type="checkbox"]), textarea, select').forEach((input, index) => {
      input.id ||= (form.id || 'form-' + [...document.forms].indexOf(form)) + '-field-' + index;
      input.name ||= input.id;
      const label = input.previousElementSibling;
      if (label?.tagName === 'LABEL') label.htmlFor = input.id;
      else if (!input.hasAttribute('aria-label')) input.setAttribute('aria-label', input.placeholder || (input.tagName === 'SELECT' ? 'Subject' : 'Email'));
      if (input.type === 'email') input.autocomplete = 'email';
      if (input.type === 'password') input.autocomplete = form.id === 'registerForm' ? 'new-password' : 'current-password';
    });
    if (form.classList.contains('newsletter-form')) {
      form.querySelector('input').required = true;
      form.querySelector('button').setAttribute('aria-label', 'Subscribe to newsletter');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (form.id === 'registerForm') {
        const passwords = form.querySelectorAll('input[type="password"]');
        passwords[1].setCustomValidity(passwords[0].value === passwords[1].value ? '' : 'Passwords must match.');
        if (!form.reportValidity()) return;
      }
      if (form.closest('.comment-section')) {
        const comment = document.createElement('div'); comment.className = 'comment';
        const text = document.createElement('div');
        const author = document.createElement('strong'); author.textContent = form.querySelector('input').value;
        const body = document.createElement('p'); body.textContent = form.querySelector('textarea').value;
        text.append(author, body); comment.append(text); form.nextElementSibling.prepend(comment);
        form.reset(); notify('Comment added to this page preview only.');
      } else {
        notify('This is a storefront demo. This action needs a connected service; no data was sent.');
      }
    });
    form.querySelectorAll('input[type="password"]').forEach(input => input.addEventListener('input', () => {
      form.querySelectorAll('input[type="password"]').forEach(field => field.setCustomValidity(''));
    }));
  });
  document.querySelectorAll('a[href="#"], .reply').forEach(link => {
    link.setAttribute('role', 'button');
    link.tabIndex = 0;
    const action = event => {
      event.preventDefault();
      if (link.classList.contains('reply')) document.querySelector('.comment-section textarea')?.focus();
      else notify('This link has not been configured yet.');
    };
    link.addEventListener('click', action);
    link.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') action(event); });
    const icon = link.querySelector('i');
    if (icon) link.setAttribute('aria-label', [...icon.classList].find(name => name.startsWith('bi-'))?.slice(3) || 'Social link');
  });
  document.querySelectorAll('[data-bs-target="#mobileMenu"]').forEach(button => {
    button.setAttribute('aria-controls', 'mobileMenu'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Toggle navigation');
  });
})();
