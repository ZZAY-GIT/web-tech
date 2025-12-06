// script.js — ВСЁ В ОДНОМ ФАЙЛЕ (без menu.json — работает всегда!)

const dishes = [
  // СУПЫ
  { keyword: "gazpacho", name: "Гаспачо", price: 195, category: "soup", kind: "veg", count: "350 г", image: "menu/soups/gazpacho.jpg" },
  { keyword: "mushroom_soup", name: "Грибной суп-пюре", price: 185, category: "soup", kind: "veg", count: "330 г", image: "menu/soups/mushroom_soup.jpg" },
  { keyword: "norwegian_soup", name: "Норвежский суп", price: 270, category: "soup", kind: "fish", count: "330 г", image: "menu/soups/norwegian_soup.jpg" },
  { keyword: "chicken_soup", name: "Куриный суп", price: 220, category: "soup", kind: "meat", count: "320 г", image: "menu/soups/chicken.jpg" },
  { keyword: "ramen", name: "Рамен", price: 350, category: "soup", kind: "meat", count: "400 г", image: "menu/soups/ramen.jpg" },
  { keyword: "tomyum", name: "Том Ям", price: 380, category: "soup", kind: "fish", count: "380 г", image: "menu/soups/tomyum.jpg" },

  // ГЛАВНЫЕ БЛЮДА
  { keyword: "fried_potatoes", name: "Жареная картошка с грибами", price: 150, category: "main", kind: "veg", count: "250 г", image: "menu/main_course/friedpotatoeswithmushrooms1.jpg" },
  { keyword: "lasagna", name: "Лазанья", price: 385, category: "main", kind: "meat", count: "310 г", image: "menu/main_course/lasagna.jpg" },
  { keyword: "chicken_cutlets", name: "Котлеты с пюре", price: 225, category: "main", kind: "meat", count: "280 г", image: "menu/main_course/chickencutletsandmashedpotatoes.jpg" },
  { keyword: "shrimp_pasta", name: "Паста с креветками", price: 420, category: "main", kind: "fish", count: "320 г", image: "menu/main_course/shrimppasta.jpg" },
  { keyword: "fish_rice", name: "Рыба с рисом", price: 390, category: "main", kind: "fish", count: "300 г", image: "menu/main_course/fishrice.jpg" },
  { keyword: "pizza", name: "Пицца Маргарита", price: 450, category: "main", kind: "veg", count: "500 г", image: "menu/main_course/pizza.jpg" },

  // НАПИТКИ
  { keyword: "orange_juice", name: "Апельсиновый сок", price: 120, category: "drink", kind: "cold", count: "300 мл", image: "menu/beverages/orangejuice.jpg" },
  { keyword: "apple_juice", name: "Яблочный сок", price: 90, category: "drink", kind: "cold", count: "300 мл", image: "menu/beverages/applejuice.jpg" },
  { keyword: "carrot_juice", name: "Морковный сок", price: 110, category: "drink", kind: "cold", count: "300 мл", image: "menu/beverages/carrotjuice.jpg" },
  { keyword: "tea", name: "Чай чёрный", price: 80, category: "drink", kind: "hot", count: "200 мл", image: "menu/beverages/tea.jpg" },
  { keyword: "green_tea", name: "Зелёный чай", price: 100, category: "drink", kind: "hot", count: "200 мл", image: "menu/beverages/greentea.jpg" },
  { keyword: "cappuccino", name: "Капучино", price: 180, category: "drink", kind: "hot", count: "250 мл", image: "menu/beverages/cappuccino.jpg" },

  // САЛАТЫ И СТАРТЕРЫ
  { keyword: "caesar", name: "Цезарь с курицей", price: 320, category: "salad", kind: "meat", count: "220 г", image: "menu/salads_starters/caesar.jpg" },
  { keyword: "tuna_salad", name: "Салат с тунцом", price: 360, category: "salad", kind: "fish", count: "200 г", image: "menu/salads_starters/tunasalad.jpg" },
  { keyword: "caprese", name: "Капрезе", price: 290, category: "salad", kind: "veg", count: "180 г", image: "menu/salads_starters/caprese.jpg" },
  { keyword: "salad_egg", name: "Салат с яйцом", price: 180, category: "salad", kind: "veg", count: "190 г", image: "menu/salads_starters/saladwithegg.jpg" },
  { keyword: "fries1", name: "Картофель фри", price: 150, category: "salad", kind: "veg", count: "150 г", image: "menu/salads_starters/frenchfries1.jpg" },
  { keyword: "fries2", name: "Картофель фри с сыром", price: 190, category: "salad", kind: "veg", count: "180 г", image: "menu/salads_starters/frenchfries2.jpg" },

  // ДЕСЕРТЫ
  { keyword: "donuts", name: "Пончики", price: 180, category: "dessert", kind: "small", count: "2 шт", image: "menu/desserts/donuts.jpg" },
  { keyword: "donuts2", name: "Пончики с шоколадом", price: 220, category: "dessert", kind: "small", count: "2 шт", image: "menu/desserts/donuts2.jpg" },
  { keyword: "baklava", name: "Баклава", price: 250, category: "dessert", kind: "small", count: "100 г", image: "menu/desserts/baklava.jpg" },
  { keyword: "cheesecake", name: "Чизкейк", price: 320, category: "dessert", kind: "medium", count: "120 г", image: "menu/desserts/checheesecake.jpg" },
  { keyword: "chocolate_cake", name: "Шоколадный торт", price: 380, category: "dessert", kind: "medium", count: "150 г", image: "menu/desserts/chocolatecake.jpg" },
  { keyword: "chocolate_cheesecake", name: "Шоколадный чизкейк", price: 450, category: "dessert", kind: "large", count: "180 г", image: "menu/desserts/chocolatecheesecake.jpg" }
];

let selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
let activeFilters = {};

document.addEventListener('DOMContentLoaded', () => {
    const containers = {
        soup: document.getElementById('soups'),
        main: document.getElementById('mains'),
        drink: document.getElementById('drinks'),
        salad: document.getElementById('salads'),
        dessert: document.getElementById('desserts')
    };

    renderDishes(containers);
    updateOrderSummary();
    setupFilters(containers);
});

function renderDishes(containers) {
    Object.values(containers).forEach(c => c.innerHTML = '');

    const grouped = {
        soup: dishes.filter(d => d.category === 'soup'),
        main: dishes.filter(d => d.category === 'main'),
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

            // Проверяем, выбрано ли это блюдо
            const isSelected = selected[dish.category]?.keyword === dish.keyword;

            // Добавляем класс для подсветки
            if (isSelected) {
                card.classList.add('selected');
            }

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
                const selectMap = {
                    soup: 'soup',
                    main: 'main_dish',
                    drink: 'drink',
                    salad: 'salad',
                    dessert: 'dessert'
                };
                const selectId = selectMap[dish.category];
                if (selectId) document.getElementById(selectId).value = dish.keyword;

                renderDishes(containers);  // ← Перерисовываем — кнопка обновится!
                updateOrderSummary();
            };

            card.onclick = (e) => {
                if (!e.target.classList.contains('add-btn')) {
                    btn.click();
                }
            };

            containers[cat].appendChild(card);
        });
    }
}

function setupFilters(containers) {
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
            renderDishes(containers);
        });
    });
}

function updateOrderSummary() {
    const summary = document.getElementById('order-summary');
    let html = '';
    let total = 0;

    const items = [
        { item: selected.soup, label: 'Суп' },
        { item: selected.main, label: 'Главное блюдо' },
        { item: selected.drink, label: 'Напиток' },
        { item: selected.salad, label: 'Салат/стартер' },
        { item: selected.dessert, label: 'Десерт' }
    ];

    const hasAny = items.some(i => i.item);

    if (!hasAny) {
        html = '<p style="text-align:center;color:#999;font-style:italic;margin:40px 0;">Ничего не выбрано</p>';
    } else {
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

// Сброс
document.querySelector('button[type="reset"]')?.addEventListener('click', () => {
    setTimeout(() => {
        selected = { soup: null, main: null, drink: null, salad: null, dessert: null };
        document.querySelectorAll('select').forEach(s => s.value = '');
        document.querySelectorAll('.dish').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        activeFilters = {};
        renderDishes({
            soup: document.getElementById('soups'),
            main: document.getElementById('mains'),
            drink: document.getElementById('drinks'),
            salad: document.getElementById('salads'),
            dessert: document.getElementById('desserts')
        });
        updateOrderSummary();
    }, 100);
});