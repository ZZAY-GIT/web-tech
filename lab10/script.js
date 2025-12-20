let dishes = [];
let selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
let activeFilters = {};
let orders = [];
let currentOrderId = null;

const SPECIAL_COMBO_KEYWORDS = {
    soup: 'ramen',
    main: 'pizza',
    drink: 'cappuccino'
};
const SPECIAL_COMBO_FIXED_PRICE = 600;

const containers = {
    soup: document.getElementById('soups'),
    main: document.getElementById('mains'),
    drink: document.getElementById('drinks'),
    salad: document.getElementById('salads'),
    dessert: document.getElementById('desserts')
};

const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
const API_KEY = '37a9b8fd-91a9-4b31-b322-89553ccc0c94'; // твой ключ

// === Загрузка блюд ===
async function loadDishes() {
    try {
        const response = await fetch(`${API_BASE}/dishes`);
        if (!response.ok) throw new Error('Ошибка загрузки блюд');
        dishes = await response.json();

        loadFromStorage();
        renderPage();
        updateOrderSummaryOrPanel();
        setupFilters();
        setupSpecialCombo();

    } catch (error) {
        console.error(error);
        document.querySelector('.container')?.insertAdjacentHTML('afterbegin',
            '<h2 style="color:red;text-align:center;padding:20px;background:#fee;">Не удалось загрузить меню</h2>'
        );
    }
}

// localStorage
function loadFromStorage() {
    const saved = JSON.parse(localStorage.getItem('selectedDishes') || '{}');
    for (const cat in saved) {
        if (cat === 'isSpecialCombo') {
            selected.isSpecialCombo = saved[cat];
        } else {
            const keyword = saved[cat];
            const dish = dishes.find(d => d.keyword === keyword);
            if (dish) selected[cat] = dish;
        }
    }
}

function saveToStorage() {
    const toSave = {};
    for (const cat in selected) {
        if (selected[cat] && selected[cat].keyword) {
            toSave[cat] = selected[cat].keyword;
        } else if (cat === 'isSpecialCombo') {
            toSave[cat] = selected[cat];
        }
    }
    localStorage.setItem('selectedDishes', JSON.stringify(toSave));
}

// Рендер
function renderPage() {
    if (containers.soup) renderDishes();
    else if (document.getElementById('order-dishes')) renderOrderDishes();
}

function renderDishes() {
    Object.values(containers).forEach(c => c && (c.innerHTML = ''));

    const grouped = {
        soup: dishes.filter(d => d.category === 'soup'),
        main: dishes.filter(d => d.category === 'main-course'),
        drink: dishes.filter(d => d.category === 'drink'),
        salad: dishes.filter(d => d.category === 'salad'),
        dessert: dishes.filter(d => d.category === 'dessert')
    };

    for (const [cat, list] of Object.entries(grouped)) {
        let filtered = activeFilters[cat] ? list.filter(d => d.kind === activeFilters[cat]) : list;
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        filtered.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'dish';
            card.dataset.dish = dish.keyword;
            if (selected[dish.category]?.keyword === dish.keyword) card.classList.add('selected');

            card.innerHTML = `
                <img src="${dish.image}" alt="${dish.name}" onerror="this.src='menu/placeholder.jpg'">
                <p>${dish.price} ₽</p>
                <p>${dish.name}</p>
                <p>${dish.count}</p>
                <button class="add-btn">${selected[dish.category]?.keyword === dish.keyword ? 'Уже в заказе' : 'Добавить в заказ'}</button>
            `;

            card.querySelector('.add-btn').onclick = e => {
                e.stopPropagation();
                delete selected.isSpecialCombo;
                selected[dish.category] = dish;
                saveToStorage();
                renderPage();
                updateOrderSummaryOrPanel();
            };

            card.onclick = e => {
                if (!e.target.classList.contains('add-btn')) card.querySelector('.add-btn').click();
            };

            containers[cat]?.appendChild(card);
        });
    }
}

function renderOrderDishes() {
    const container = document.getElementById('order-dishes');
    const empty = document.getElementById('empty-order');
    if (!container) return;

    container.innerHTML = '';
    let has = false;

    ['soup', 'main', 'salad', 'drink', 'dessert'].forEach(cat => {
        const dish = selected[cat];
        if (dish) {
            has = true;
            const card = document.createElement('div');
            card.className = 'dish selected';
            card.innerHTML = `
                <img src="${dish.image}" alt="${dish.name}" onerror="this.src='menu/placeholder.jpg'">
                <p>${dish.price} ₽</p>
                <p>${dish.name}</p>
                <p>${dish.count}</p>
                <button class="remove-btn">Удалить</button>
            `;
            card.querySelector('.remove-btn').onclick = () => {
                selected[cat] = null;
                if (cat !== 'dessert') delete selected.isSpecialCombo;
                saveToStorage();
                renderOrderDishes();
                updateOrderSummaryOrPanel();
            };
            container.appendChild(card);
        }
    });

    container.style.display = has ? 'grid' : 'none';
    empty.style.display = has ? 'none' : 'block';
}

// Фильтры
function setupFilters() {
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.parentElement.dataset.category;
            const kind = btn.dataset.kind;

            if (activeFilters[category] === kind) {
                delete activeFilters[category];
                btn.classList.remove('active');
            } else {
                activeFilters[category] = kind;
                btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            renderDishes();
        });
    });
}

// Специальное комбо
function setupSpecialCombo() {
    const card = document.querySelector('.combo-card[data-combo="special-pizza-ramen"]');
    if (!card) return;

    const comboDishes = {
        soup: dishes.find(d => d.keyword === SPECIAL_COMBO_KEYWORDS.soup),
        main: dishes.find(d => d.keyword === SPECIAL_COMBO_KEYWORDS.main && d.category === 'main-course'),
        drink: dishes.find(d => d.keyword === SPECIAL_COMBO_KEYWORDS.drink)
    };

    card.querySelector('.select-combo-btn')?.addEventListener('click', () => {
        if (!comboDishes.soup || !comboDishes.main || !comboDishes.drink) {
            showNotification('Не все блюда спецкомбо доступны');
            return;
        }
        selected.soup = comboDishes.soup;
        selected.main = comboDishes.main;
        selected.drink = comboDishes.drink;
        selected.salad = null;
        selected.isSpecialCombo = true;
        saveToStorage();
        renderPage();
        updateOrderSummaryOrPanel();
        showNotification(`Спецкомбо за ${SPECIAL_COMBO_FIXED_PRICE} ₽ добавлено!`);
    });
}

// Обновление сумм
function updateOrderSummaryOrPanel() {
    if (document.getElementById('order-summary')) updateOrderSummary();
    else if (document.getElementById('go-to-order-panel')) updateGoToOrderPanel();
}

function calculateTotal() {
    let total = 0;
    const isSpecial = selected.isSpecialCombo === true;
    ['soup', 'main', 'drink', 'salad', 'dessert'].forEach(cat => {
        const dish = selected[cat];
        if (dish) {
            if (!isSpecial || cat === 'dessert') total += dish.price;
        }
    });
    if (isSpecial) total = SPECIAL_COMBO_FIXED_PRICE + (selected.dessert ? selected.dessert.price : 0);
    return total;
}

function isValidCombo() {
    const hasSoup = !!selected.soup;
    const hasMain = !!selected.main;
    const hasSalad = !!selected.salad;
    const hasDrink = !!selected.drink;
    const isSpecial = selected.isSpecialCombo === true;

    return isSpecial ||
        (hasSoup && hasMain && hasSalad && hasDrink) ||
        (hasSoup && hasMain && hasDrink) ||
        (hasSoup && hasSalad && hasDrink) ||
        (hasMain && hasSalad && hasDrink) ||
        (hasMain && hasDrink);
}

function updateOrderSummary() {
    const summary = document.getElementById('order-summary');
    if (!summary) return;

    let html = '';
    let total = calculateTotal();
    const isSpecial = selected.isSpecialCombo === true;

    const items = [
        { item: selected.soup, label: 'Суп' },
        { item: selected.main, label: 'Главное блюдо' },
        { item: selected.drink, label: 'Напиток' },
        { item: selected.salad, label: 'Салат/стартер' },
        { item: selected.dessert, label: 'Десерт' }
    ];

    items.forEach(({ item, label }) => {
        if (item) {
            html += `<p><strong>${label}:</strong> ${item.name} — ${item.price} ₽</p>`;
        } else {
            html += `<p><strong>${label}:</strong> <span style="color:#aaa;">Не выбран${label.includes('блюдо') ? 'о' : ''}</span></p>`;
        }
    });

    if (isSpecial) {
        html += `<hr style="margin:15px 0"><p style="color:green;font-weight:bold;">Спецкомбо: скидка применена! Цена: ${SPECIAL_COMBO_FIXED_PRICE} ₽</p>`;
    }

    html += `<div style="margin-top:25px;padding-top:15px;border-top:2px dashed #ddd;font-size:21px;font-weight:bold;text-align:right;">
                Итого: <span style="color:tomato;">${total} ₽</span>
             </div>`;

    if (Object.values(selected).filter(d => d).length === 0) {
        html = '<p style="text-align:center;color:#999;font-style:italic;">Ничего не выбрано</p>';
    }

    summary.innerHTML = html;
}

function updateGoToOrderPanel() {
    const panel = document.getElementById('go-to-order-panel');
    if (!panel) return;

    const hasAny = Object.values(selected).some(d => d);
    const valid = isValidCombo();

    panel.style.display = hasAny ? 'block' : 'none';
    if (hasAny) {
        document.getElementById('total-price').textContent = calculateTotal();
        const link = document.getElementById('go-to-order-link');
        if (valid) {
            link.classList.remove('disabled');
            link.href = 'order.html';
        } else {
            link.classList.add('disabled');
            link.removeAttribute('href');
        }
    }
}

// Оформление заказа
function setupFormSubmit() {
    const form = document.querySelector('.order-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!isValidCombo()) return showNotification(getErrorMessage());

        const type = document.querySelector('input[name="delivery_type"]:checked').value;
        let time = null;
        if (type === 'specific') {
            time = document.getElementById('delivery_time').value;
            if (!time) return showNotification('Укажите время');
        }

        const data = {
            full_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subscribe: document.getElementById('subscribe').checked ? 1 : 0,
            phone: document.getElementById('phone').value,
            delivery_address: document.getElementById('address').value,
            delivery_type: type === 'asap' ? 'now' : 'by_time',
            comment: document.getElementById('comment').value || ''
        };
        if (time) data.delivery_time = time;

        if (selected.soup) data.soup_id = selected.soup.id;
        if (selected.main) data.main_course_id = selected.main.id;
        if (selected.salad) data.salad_id = selected.salad.id;
        if (selected.drink) data.drink_id = selected.drink.id;
        if (selected.dessert) data.dessert_id = selected.dessert.id;

        try {
            const resp = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!resp.ok) throw new Error('Ошибка сервера');
            localStorage.removeItem('selectedDishes');
            selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
            renderPage();
            updateOrderSummaryOrPanel();
            showNotification('Заказ успешно оформлен!');
        } catch (err) {
            showNotification('Ошибка отправки: ' + err.message);
        }
    });
}

function getErrorMessage() {
    if (!selected.drink) return 'Выберите напиток — он обязателен!';
    if (!selected.main && !selected.salad) return 'Выберите главное блюдо или салат';
    return 'Состав не соответствует доступным комбо';
}


// === История заказов ===
function calculateTotalFromOrder(order) {
    let total = 0;
    const isSpecial = order.soup_id && order.main_course_id && order.drink_id &&
        dishes.find(d => d.keyword === 'ramen' && d.id === order.soup_id) &&
        dishes.find(d => d.keyword === 'pizza' && d.id === order.main_course_id) &&
        dishes.find(d => d.keyword === 'cappuccino' && d.id === order.drink_id);

    if (isSpecial) {
        total = SPECIAL_COMBO_FIXED_PRICE;
    } else {
        if (order.soup_id) total += dishes.find(d => d.id === order.soup_id)?.price || 0;
        if (order.main_course_id) total += dishes.find(d => d.id === order.main_course_id)?.price || 0;
        if (order.salad_id) total += dishes.find(d => d.id === order.salad_id)?.price || 0;
        if (order.drink_id) total += dishes.find(d => d.id === order.drink_id)?.price || 0;
    }
    if (order.dessert_id) total += dishes.find(d => d.id === order.dessert_id)?.price || 0;
    return total;
}

function getDishNameById(id) {
    const dish = dishes.find(d => d.id === id);
    return dish ? dish.name : '—';
}

function renderOrdersTable() {
    const tbody = document.getElementById('orders-body');
    const no = document.getElementById('no-orders');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (orders.length === 0) {
        no.style.display = 'block';
        return;
    }
    no.style.display = 'none';

    orders.forEach((order, i) => {
        const names = [
            order.soup_id ? getDishNameById(order.soup_id) : null,
            order.main_course_id ? getDishNameById(order.main_course_id) : null,
            order.salad_id ? getDishNameById(order.salad_id) : null,
            order.drink_id ? getDishNameById(order.drink_id) : null,
            order.dessert_id ? getDishNameById(order.dessert_id) : null
        ].filter(Boolean).join(', ') || '—';

        const total = calculateTotalFromOrder(order);
        const delivery = order.delivery_type === 'now' ? 'Как можно скорее' : `К ${order.delivery_time || '—'}`;

        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${new Date(order.created_at).toLocaleString('ru-RU')}</td>
                <td>${names}</td>
                <td>${total} ₽</td>
                <td>${delivery}</td>
                <td class="actions">
                    <i class="bi bi-eye" data-action="detail" data-id="${order.id}"></i>
                    <i class="bi bi-pencil" data-action="edit" data-id="${order.id}"></i>
                    <i class="bi bi-trash" data-action="delete" data-id="${order.id}"></i>
                </td>
            </tr>
        `;
    });
}

async function loadOrders() {
    try {
        const resp = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`);
        if (!resp.ok) throw new Error('Ошибка авторизации');
        orders = await resp.json();
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderOrdersTable();
    } catch (err) {
        showNotification('Не удалось загрузить заказы: ' + err.message);
    }
}

function showModal(modalId) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById(modalId);

    // Показываем фон, делая его flex-контейнером
    overlay.classList.add('active');
    
    // Показываем нужное окно внутри
    modal.style.display = 'block';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    const allModals = document.querySelectorAll('.modal-content');

    // Скрываем фон
    overlay.classList.remove('active');
    
    // Скрываем все окна внутри
    allModals.forEach(modal => modal.style.display = 'none');
}


function showNotification(message) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    overlay.innerHTML = `
        <div class="notification">
            <h3>Уведомление</h3>
            <p>${message}</p>
            <button>Окей</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('active');
    overlay.querySelector('button').onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300); // Удаляем после завершения анимации
    };
    overlay.onclick = e => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300); // Удаляем после завершения анимации
        }
    };
}

function showDetailModal(id) {
    const order = orders.find(o => o.id == id);
    if (!order) return;

    const names = [
        order.soup_id ? getDishNameById(order.soup_id) : null,
        order.main_course_id ? getDishNameById(order.main_course_id) : null,
        order.salad_id ? getDishNameById(order.salad_id) : null,
        order.drink_id ? getDishNameById(order.drink_id) : null,
        order.dessert_id ? getDishNameById(order.dessert_id) : null
    ].filter(Boolean).join(', ') || '—';

    const total = calculateTotalFromOrder(order);

    document.getElementById('detail-content').innerHTML = `
        <p><strong>Имя:</strong> ${order.full_name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Телефон:</strong> ${order.phone}</p>
        <p><strong>Адрес:</strong> ${order.delivery_address}</p>
        <p><strong>Доставка:</strong> ${order.delivery_type === 'now' ? 'Как можно скорее' : 'К ' + (order.delivery_time || '—')}</p>
        <p><strong>Состав:</strong> ${names}</p>
        <p><strong>Стоимость:</strong> ${total} ₽</p>
        <p><strong>Комментарий:</strong> ${order.comment || 'Нет'}</p>
    `;

    showModal('detail-modal');
}

function showEditModal(id) {
    const order = orders.find(o => o.id == id);
    if (!order) return;

    document.getElementById('edit-id').textContent = id;
    document.getElementById('edit-name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-address').value = order.delivery_address;
    document.getElementById('edit-comment').value = order.comment || '';

    document.querySelector(`input[name="edit_delivery_type"][value="${order.delivery_type === 'now' ? 'asap' : 'specific'}"]`).checked = true;
    document.getElementById('edit-delivery-time').value = order.delivery_time || '';

    showModal('edit-modal');
}

function showDeleteModal(id) {
    document.getElementById('delete-id').textContent = id;
    showModal('delete-modal');
}

// Инициализация страницы заказов
if (document.getElementById('orders-body')) {
    loadOrders();

    document.addEventListener('click', e => {
        if (e.target.matches('.actions i')) {
            const action = e.target.dataset.action;
            const id = e.target.dataset.id;
            currentOrderId = id;
            if (action === 'detail') showDetailModal(id);
            if (action === 'edit') showEditModal(id);
            if (action === 'delete') showDeleteModal(id);
        }
    });

    document.getElementById('modal-overlay')?.addEventListener('click', closeModal);
    document.querySelectorAll('.close-btn, .modal-ok, .modal-cancel').forEach(btn => btn.addEventListener('click', closeModal));

    document.getElementById('edit-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const type = document.querySelector('input[name="edit_delivery_type"]:checked').value;
        const data = {
            full_name: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            delivery_address: document.getElementById('edit-address').value,
            delivery_type: type === 'asap' ? 'now' : 'by_time',
            comment: document.getElementById('edit-comment').value || ''
        };
        if (type === 'specific') {
            const time = document.getElementById('edit-delivery-time').value;
            if (time) data.delivery_time = time;
        }

        try {
            const resp = await fetch(`${API_BASE}/orders/${currentOrderId}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!resp.ok) throw new Error('Ошибка');
            showNotification('Заказ изменён');
            closeModal();
            loadOrders();
        } catch (err) {
            showNotification('Ошибка редактирования');
        }
    });

    document.getElementById('confirm-delete')?.addEventListener('click', async () => {
        try {
            const resp = await fetch(`${API_BASE}/orders/${currentOrderId}?api_key=${API_KEY}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('Ошибка');
            showNotification('Заказ удалён');
            closeModal();
            loadOrders();
        } catch (err) {
            showNotification('Ошибка удаления');
        }
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    loadDishes();
    setupFormSubmit();
});