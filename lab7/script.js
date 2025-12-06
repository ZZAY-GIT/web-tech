// script.js — Лабораторная №7: загрузка блюд с API

let dishes = [];
let selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
let activeFilters = {};

const containers = {
    soup: document.getElementById('soups'),
    main: document.getElementById('mains'),
    drink: document.getElementById('drinks'),
    salad: document.getElementById('salads'),
    dessert: document.getElementById('desserts')
};

// === 1. Загрузка блюд с API ===
async function loadDishes() {
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        dishes = await response.json();
        console.log('Блюда успешно загружены с API:', dishes);

        renderDishes();
        updateOrderSummary();
        setupFilters();

    } catch (error) {
        console.error('Ошибка загрузки блюд:', error);
        document.querySelector('.container').insertAdjacentHTML('afterbegin',
            '<h2 style="color:red;text-align:center;padding:20px;background:#fee;">Не удалось загрузить меню с сервера</h2>'
        );
    }
}

function renderDishes() {
    Object.values(containers).forEach(c => c.innerHTML = '');

    const grouped = {
        soup: dishes.filter(d => d.category === 'soup'),
        main: dishes.filter(d => d.category === 'main-course'),
        drink: dishes.filter(d => d.category === 'drink'),
        salad: dishes.filter(d => d.category === 'salad'),
        dessert: dishes.filter(d => d.category === 'dessert')
    };

    for (const [cat, list] of Object.entries(grouped)) {
        let filtered = activeFilters[cat] 
            ? list.filter(d => d.kind === activeFilters[cat])
            : list;

        filtered.sort((a, b) => a.name.localeCompare(b.name));

        filtered.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'dish';
            card.dataset.dish = dish.keyword;

            const isSelected = selected[dish.category]?.keyword === dish.keyword;
            if (isSelected) card.classList.add('selected');

            card.innerHTML = `
                <img src="${dish.image}" alt="${dish.name}" onerror="this.src='menu/placeholder.jpg'">
                <p>${dish.price} ₽</p>
                <p>${dish.name}</p>
                <p>${dish.count}</p>
                <button class="add-btn">
                    ${isSelected ? 'Уже в заказе' : 'Добавить в заказ'}
                </button>
            `;

            const btn = card.querySelector('.add-btn');
            btn.onclick = (e) => {
                e.stopPropagation();
                selected[dish.category] = dish;

                // Заполняем скрытые поля
                const map = { soup: 'soup', main: 'main_dish', drink: 'drink', salad: 'salad', dessert: 'dessert' };
                document.getElementById(map[dish.category]).value = dish.keyword;

                renderDishes();
                updateOrderSummary();
            };

            card.onclick = (e) => {
                if (!e.target.classList.contains('add-btn')) btn.click();
            };

            containers[cat].appendChild(card);
        });
    }
}

// === 3. Фильтры ===
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

// === 4. Обновление блока заказа ===
function updateOrderSummary() {
    const summary = document.getElementById('order-summary');
    let html = '';
    let total = 0;
    const hasAny = Object.values(selected).some(d => d !== null);

    if (!hasAny) {
        html = '<p style="text-align:center;color:#999;font-style:italic;margin:40px 0;">Ничего не выбрано</p>';
    } else {
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
                total += item.price;
            } else {
                html += `<p><strong>${label}:</strong> <span style="color:#aaa;">Не выбрано</span></p>`;
            }
        });

        html += `<div style="margin-top:25px;padding-top:15px;border-top:2px dashed #ddd;font-size:21px;font-weight:bold;text-align:right;">
                    Итого: <span style="color:tomato;">${total} ₽</span>
                 </div>`;
    }
    summary.innerHTML = html;
}

// === 5. Проверка заказа при отправке ===
document.querySelector('form').addEventListener('submit', function(e) {
    const hasSoup = !!selected.soup;
    const hasMain = !!selected.main;
    const hasSalad = !!selected.salad;
    const hasDrink = !!selected.drink;

    const validCombos = [
        hasSoup && hasMain && hasSalad && hasDrink,
        hasSoup && hasMain && hasDrink,
        hasSoup && hasSalad && hasDrink,
        hasMain && hasSalad && hasDrink,
        hasMain && hasDrink
    ];

    if (!validCombos.includes(true)) {
        e.preventDefault();
        showNotification(getErrorMessage());
    }
});

function getErrorMessage() {
    const s = selected;
    if (!s.soup && !s.main && !s.salad && !s.drink) return 'Ничего не выбрано. Выберите блюда для заказа';
    if (!s.drink) return 'Выберите напиток';
    if (s.soup && !s.main && !s.salad) return 'Выберите главное блюдо/салат/стартер';
    if (s.salad && !s.soup && !s.main) return 'Выберите суп или главное блюдо';
    if (!s.main && !s.salad) return 'Выберите главное блюдо';
    return 'Выбранные блюда не соответствуют ни одному ланчу';
}

// === 6. Уведомление ===
function showNotification(message) {
    document.querySelectorAll('.notification-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    overlay.innerHTML = `
        <div class="notification">
            <h3>Ошибка заказа</h3>
            <p>${message}</p>
            <button>Окей</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('button').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// === 7. Сброс ===
document.querySelector('button[type="reset"]')?.addEventListener('click', () => {
    setTimeout(() => {
        selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
        document.querySelectorAll('select').forEach(s => s.value = '');
        document.querySelectorAll('.dish').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        activeFilters = {};
        renderDishes();
        updateOrderSummary();
    }, 100);
});

// === ЗАПУСК ===
document.addEventListener('DOMContentLoaded', loadDishes);