let dishes = [];
let selected = { soup: null, main: null, drink: null };

document.addEventListener('DOMContentLoaded', async () => {
    const containers = {
        soup: document.getElementById('soups'),
        main: document.getElementById('mains'),
        drink: document.getElementById('drinks')
    };

    if (!containers.soup || !containers.main || !containers.drink) {
        console.error('Не найдены контейнеры для блюд!');
        return;
    }

    try {
        const response = await fetch('menu.json');
        if (!response.ok) throw new Error('menu.json не найден или ошибка сервера');
        
        dishes = await response.json();
        console.log('Меню успешно загружено:', dishes);

        renderDishes(containers);
        updateOrderSummary();

    } catch (error) {
        console.error('Ошибка:', error);
        document.querySelector('.container').insertAdjacentHTML('afterbegin',
            '<h2 style="color:red;text-align:center;padding:20px;background:#fee;">Не удалось загрузить меню. Проверьте файл menu.json и пути к картинкам.</h2>'
        );
    }
});

function renderDishes(containers) {
    Object.values(containers).forEach(c => c.innerHTML = '');

    const grouped = {
        soup: dishes.filter(d => d.category === 'soup').sort((a, b) => a.name.localeCompare(b.name)),
        main: dishes.filter(d => d.category === 'main').sort((a, b) => a.name.localeCompare(b.name)),
        drink: dishes.filter(d => d.category === 'drink').sort((a, b) => a.name.localeCompare(b.name))
    };

    for (const [cat, list] of Object.entries(grouped)) {
        list.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'dish';
            card.dataset.dish = dish.keyword;

            const isSelected = selected[cat]?.keyword === dish.keyword;
            if (isSelected) {
                card.style.border = '4px solid tomato';
                card.style.transform = 'scale(1.04)';
                card.style.boxShadow = '0 10px 25px rgba(255,99,71,0.35)';
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

                if (dish.category === 'soup')  document.getElementById('soup').value = dish.keyword;
                if (dish.category === 'main')  document.getElementById('main_dish').value = dish.keyword;
                if (dish.category === 'drink') document.getElementById('drink').value = dish.keyword;

                renderDishes(containers);
                updateOrderSummary();
            };

            card.onclick = (e) => {
                if (e.target !== btn) {
                    btn.click();
                }
            };

            containers[cat].appendChild(card);
        });
    }
}

function updateOrderSummary() {
    const summary = document.getElementById('order-summary');
    if (!summary) return;

    let html = '';
    let total = 0;
    const hasAny = selected.soup || selected.main || selected.drink;

    if (!hasAny) {
        html = '<p style="text-align:center;color:#999;font-style:italic;margin:40px 0;">Ничего не выбрано</p>';
    } else {
        if (selected.soup)  { html += `<p><strong>Суп:</strong> ${selected.soup.name} — ${selected.soup.price} ₽</p>`; total += selected.soup.price; }
        else                { html += `<p><strong>Суп:</strong> <span style="color:#aaa;">Блюдо не выбрано</span></p>`; }

        if (selected.main)  { html += `<p><strong>Главное блюдо:</strong> ${selected.main.name} — ${selected.main.price} ₽</p>`; total += selected.main.price; }
        else                { html += `<p><strong>Главное блюдо:</strong> <span style="color:#aaa;">Блюдо не выбрано</span></p>`; }

        if (selected.drink) { html += `<p><strong>Напиток:</strong> ${selected.drink.name} — ${selected.drink.price} ₽</p>`; total += selected.drink.price; }
        else                { html += `<p><strong>Напиток:</strong> <span style="color:#aaa;">Напиток не выбран</span></p>`; }

        html += `<div style="margin-top:25px;padding-top:15px;border-top:2px dashed #ddd;font-size:21px;font-weight:bold;text-align:right;">
                    Итого: <span style="color:tomato;">${total} ₽</span>
                 </div>`;
    }
    summary.innerHTML = html;
}

document.addEventListener('click', (e) => {
    if (e.target.type === 'reset') {
        setTimeout(() => {
            selected = { soup: null, main: null, drink: null };
            document.getElementById('soup').value = '';
            document.getElementById('main_dish').value = '';
            document.getElementById('drink').value = '';
            document.querySelectorAll('.dish').forEach(card => {
                card.style.border = '';
                card.style.transform = '';
                card.style.boxShadow = '';
            });
            updateOrderSummary();
        }, 100);
    }
});