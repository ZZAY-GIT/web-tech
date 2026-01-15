const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
const appkkk = '37a9b8fd-91a9-4b31-b322-89553ccc0c94';
const PER_PAGE = 5;

let currentCourseData = null;
let selectedTutorId = null;

function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    container.appendChild(alert);

    setTimeout(() => alert.remove(), 5000);
}

async function loadCourses(page = 1, searchName = '', searchLevel = '') {
    const tbody = document.getElementById('courses-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/courses?api_key=${appkkk}`);
        if (!res.ok) throw new Error(await res.text());

        let courses = await res.json();

        if (searchName) courses = courses.filter(c => c.name.toLowerCase().includes(searchName.toLowerCase()));
        if (searchLevel) courses = courses.filter(c => c.level === searchLevel);

        const total = courses.length;
        const start = (page - 1) * PER_PAGE;
        const paginated = courses.slice(start, start + PER_PAGE);

        tbody.innerHTML = paginated.map(c => `
            <tr>
                <td>${c.name}</td>
                <td title="${c.description.replace(/"/g,'&quot;')}">${c.description.substring(0,60)}${c.description.length > 60 ? '...' : ''}</td>
                <td>${c.teacher}</td>
                <td>${c.level}</td>
                <td>${c.total_length}</td>
                <td>${c.week_length}</td>
                <td>${c.course_fee_per_hour} ₽/ч</td>
                <td><button class="btn btn-sm btn-primary" onclick="openOrderModal('course', ${c.id}, '${c.name.replace(/'/g,"\\'")}', '${c.teacher.replace(/'/g,"\\'")}', ${c.total_length}, ${c.week_length}, ${c.course_fee_per_hour}, '${JSON.stringify(c.start_dates).replace(/"/g,'&quot;')}')">Оформить</button></td>
            </tr>
        `).join('');

        const pag = document.getElementById('courses-pagination');
        if (pag) {
            let html = '';
            const pages = Math.ceil(total / PER_PAGE);
            for (let i = 1; i <= pages; i++) {
                html += `<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#" onclick="loadCourses(${i},'${searchName.replace(/'/g,"\\'")}','${searchLevel}')">${i}</a></li>`;
            }
            pag.innerHTML = html || '<li class="page-item disabled"><span class="page-link">Нет курсов</span></li>';
        }
    } catch (e) {
        showNotification('Ошибка курсов: ' + e.message, 'danger');
    }
}

async function loadTutors(qual = '', exp = '') {
    const tbody = document.getElementById('tutors-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/tutors?api_key=${appkkk}`);
        if (!res.ok) throw new Error(await res.text());

        let tutors = await res.json();

        if (qual) tutors = tutors.filter(t => t.language_level === qual);
        if (exp) tutors = tutors.filter(t => t.work_experience >= Number(exp));

        tbody.innerHTML = tutors.map(t => `
            <tr id="tutor-${t.id}" class="${selectedTutorId===t.id?'table-primary':''}">
                <td>${t.name}</td>
                <td>${t.work_experience}</td>
                <td>${t.languages_spoken.join(', ')}</td>
                <td>${t.languages_offered.join(', ')}</td>
                <td>${t.language_level}</td>
                <td>${t.price_per_hour} ₽/ч</td>
                <td><img src="https://via.placeholder.com/50" alt="Фото" width="50"></td>
                <td><button class="btn btn-sm btn-success" onclick="selectTutor(${t.id},'${t.name.replace(/'/g,"\\'")}',${t.price_per_hour})">Выбрать</button></td>
            </tr>
        `).join('');
    } catch (e) {
        showNotification('Ошибка репетиторов: ' + e.message, 'danger');
    }
}

function selectTutor(id, name, price) {
    if (selectedTutorId) document.getElementById(`tutor-${selectedTutorId}`)?.classList.remove('table-primary');
    selectedTutorId = id;
    document.getElementById(`tutor-${id}`)?.classList.add('table-primary');
    openOrderModal('tutor', id, name, name, null, null, price, null);
}

function openOrderModal(type, id, name, teacher, weeks, hoursPerWeek, fee, datesJson) {
    const modalEl = document.getElementById('order-modal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    document.getElementById('orderModalLabel').textContent = 'Оформление заявки';

    currentCourseData = {
        type,
        id,
        name,
        teacher,
        totalWeeks: weeks || 1,
        hoursPerWeek: hoursPerWeek || 1,
        feePerHour: fee || 500,
        startDates: datesJson ? JSON.parse(datesJson) : []
    };

    const nameEl = document.getElementById('order-name');
    if (nameEl) nameEl.value = name || '';

    const teacherEl = document.getElementById('order-teacher');
    if (teacherEl) teacherEl.value = teacher || '';

    const durationEl = document.getElementById('duration');
    if (durationEl) durationEl.value = `${currentCourseData.totalWeeks * currentCourseData.hoursPerWeek} ч`;

    const dateEl = document.getElementById('start-date');
    if (dateEl) {
        dateEl.innerHTML = '<option value="">Выберите дату</option>';

        if (currentCourseData.startDates.length) {
            const unique = [...new Set(currentCourseData.startDates.map(d => d.split('T')[0]))].sort();
            unique.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = new Date(d).toLocaleDateString('ru-RU');
                dateEl.appendChild(opt);
            });
            if (unique.length) dateEl.value = unique[0];
        }

        dateEl.onchange = () => populateTimes(dateEl.value);
        if (dateEl.value) populateTimes(dateEl.value);
    }

    ['start-date','start-time','persons','supplementary','personalized','excursions','assessment','interactive']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.onchange = calculateAndShowPrice;
        });

    calculateAndShowPrice();
    modal.show();
}

function populateTimes(selectedDate) {
    const timeSelect = document.getElementById('start-time');
    if (!timeSelect) return;

    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    timeSelect.disabled = false;

    if (currentCourseData?.startDates?.length > 0 && selectedDate) {
        const times = currentCourseData.startDates
            .filter(dt => dt.startsWith(selectedDate + 'T'))
            .map(dt => dt.split('T')[1].slice(0,5))
            .sort();

        if (times.length > 0) {
            times.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                timeSelect.appendChild(opt);
            });
            timeSelect.value = times[0];
            calculateAndShowPrice();
            return;
        }
    }

    const currentTime = timeSelect.value || '10:00';
    const opt = document.createElement('option');
    opt.value = currentTime;
    opt.textContent = currentTime + ' (текущее время заказа)';
    opt.selected = true;
    timeSelect.appendChild(opt);

    ['09:00', '12:00', '15:00', '18:00'].forEach(t => {
        if (t !== currentTime) {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            timeSelect.appendChild(opt);
        }
    });

    calculateAndShowPrice();
}

function calculateAndShowPrice() {
    if (!currentCourseData) return;

    const required = ['persons','start-date','start-time','price','auto-discounts'];
    for (const id of required) {
        if (!document.getElementById(id)) return;
    }

    const persons = Number(document.getElementById('persons').value) || 1;
    const dateStr = document.getElementById('start-date').value;
    const timeStr = document.getElementById('start-time').value;

    if (!dateStr || !timeStr) {
        document.getElementById('price').value = 'Выберите дату и время';
        document.getElementById('auto-discounts').innerHTML = '';
        return;
    }

    const date = new Date(`${dateStr}T${timeStr}`);
    const hour = date.getHours();

    let dur = currentCourseData.totalWeeks * currentCourseData.hoursPerWeek || 1;
    let fee = currentCourseData.feePerHour;

    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.5 : 1;
    const morning = hour >= 9 && hour < 12 ? 400 : 0;
    const evening = hour >= 18 && hour < 20 ? 1000 : 0;

    let total = (fee * dur * weekend + morning + evening) * persons;

    if (document.getElementById('supplementary')?.checked) total += 2000 * persons;
    if (document.getElementById('personalized')?.checked) total += 1500 * currentCourseData.totalWeeks;
    if (document.getElementById('excursions')?.checked) total *= 1.25;
    if (document.getElementById('assessment')?.checked) total += 300;
    if (document.getElementById('interactive')?.checked) total *= 1.5;

    const daysAhead = (date - new Date()) / (86400 * 1000);
    let discText = '';

    if (daysAhead >= 30) { total *= 0.9; discText += '<span class="badge bg-success ms-2">-10%</span>'; }
    if (persons >= 5) { total *= 0.85; discText += '<span class="badge bg-success ms-2">-15%</span>'; }
    if (currentCourseData.hoursPerWeek >= 5) { total *= 1.2; discText += '<span class="badge bg-warning ms-2">+20%</span>'; }

    document.getElementById('price').value = Math.round(total) + ' ₽';
    document.getElementById('auto-discounts').innerHTML = discText;
}

async function submitOrder() {
    if (!currentCourseData) return showNotification('Нет данных о заявке', 'danger');

    const dateEl = document.getElementById('start-date');
    const timeEl = document.getElementById('start-time');

    if (!dateEl.value || !timeEl.value) return showNotification('Дата и время обязательны', 'warning');

    const isEdit = !!currentCourseData.editOrderId;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_BASE}/orders/${currentCourseData.editOrderId}?api_key=${appkkk}` : `${API_BASE}/orders?api_key=${appkkk}`;

    const body = {
        course_id: currentCourseData.type === 'course' ? currentCourseData.id : null,
        tutor_id: currentCourseData.type === 'tutor' ? currentCourseData.id : null,
        date_start: dateEl.value,
        time_start: timeEl.value,
        duration: Number(document.getElementById('duration')?.value.replace(/\D/g,'')) || 1,
        persons: Number(document.getElementById('persons')?.value) || 1,
        price: Number(document.getElementById('price')?.value.replace(/\D/g,'')),
        early_registration: (new Date(`${dateEl.value}T${timeEl.value}`) - new Date()) / (86400*1000) >= 30,
        group_enrollment: Number(document.getElementById('persons')?.value) >= 5,
        intensive_course: currentCourseData.hoursPerWeek >= 5,
        supplementary: !!document.getElementById('supplementary')?.checked,
        personalized: !!document.getElementById('personalized')?.checked,
        excursions: !!document.getElementById('excursions')?.checked,
        assessment: !!document.getElementById('assessment')?.checked,
        interactive: !!document.getElementById('interactive')?.checked
    };

    try {
        const res = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showNotification(isEdit ? 'Заявка обновлена' : 'Заявка создана', 'success');
            bootstrap.Modal.getInstance(document.getElementById('order-modal')).hide();
            if (document.getElementById('orders-body')) loadOrders();
        } else {
            showNotification('Ошибка сервера: ' + await res.text(), 'danger');
        }
    } catch (err) {
        showNotification('Ошибка: ' + err.message, 'danger');
    }
}

async function loadOrders(page = 1) {
    const tbody = document.getElementById('orders-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/orders?api_key=${appkkk}`);
        if (!res.ok) throw new Error(await res.text());

        let orders = await res.json();

        const total = orders.length;
        const start = (page - 1) * PER_PAGE;
        const paginated = orders.slice(start, start + PER_PAGE);

        tbody.innerHTML = paginated.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.course_id ? 'Курс #' + o.course_id : 'Репетитор #' + o.tutor_id}</td>
                <td>${o.date_start} ${o.time_start}</td>
                <td>${o.price} ₽</td>
                <td>
                    <button class="btn btn-info btn-sm me-1" onclick="showOrderDetails(${o.id})">Подробнее</button>
                    <button class="btn btn-warning btn-sm me-1" onclick="openEditOrderModal(${o.id})">Изменить</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDeleteOrder(${o.id})">Удалить</button>
                </td>
            </tr>
        `).join('');

        const pag = document.getElementById('orders-pagination');
        if (pag) {
            let html = '';
            const pages = Math.ceil(total / PER_PAGE);
            for (let i = 1; i <= pages; i++) {
                html += `<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#" onclick="loadOrders(${i})">${i}</a></li>`;
            }
            pag.innerHTML = html || '<li class="page-item disabled"><span class="page-link">Нет заказов</span></li>';
        }
    } catch (e) {
        showNotification('Ошибка загрузки заказов: ' + e.message, 'danger');
    }
}

async function showOrderDetails(id) {
    try {
        const res = await fetch(`${API_BASE}/orders/${id}?api_key=${appkkk}`);
        if (!res.ok) throw new Error(await res.text());

        const order = await res.json();

        const body = document.getElementById('details-body');
        if (body) {
            body.innerHTML = `
                <p><strong>№:</strong> ${order.id}</p>
                <p><strong>Дата и время:</strong> ${order.date_start} ${order.time_start}</p>
                <p><strong>Продолжительность:</strong> ${order.duration} ч</p>
                <p><strong>Студентов:</strong> ${order.persons}</p>
                <p><strong>Стоимость:</strong> ${order.price} ₽</p>
                <p><strong>Опции:</strong></p>
                <ul>
                    <li>Ранняя регистрация: ${order.early_registration ? 'Да' : 'Нет'}</li>
                    <li>Группа: ${order.group_enrollment ? 'Да' : 'Нет'}</li>
                    <li>Интенсив: ${order.intensive_course ? 'Да' : 'Нет'}</li>
                    <li>Доп. материалы: ${order.supplementary ? 'Да' : 'Нет'}</li>
                </ul>
            `;
            new bootstrap.Modal(document.getElementById('details-modal')).show();
        }
    } catch (err) {
        showNotification('Ошибка деталей: ' + err.message, 'danger');
    }
}

async function openEditOrderModal(id) {
    try {
        const res = await fetch(`${API_BASE}/orders/${id}?api_key=${appkkk}`);
        if (!res.ok) throw new Error(await res.text());

        const order = await res.json();

        currentCourseData = {
            type: order.course_id ? 'course' : 'tutor',
            id: order.course_id || order.tutor_id,
            editOrderId: id,
            totalWeeks: 1,
            hoursPerWeek: 1,
            feePerHour: 500,
            startDates: []
        };

        const nameEl = document.getElementById('order-name');
        if (nameEl) nameEl.value = `Заказ №${order.id} (редактирование)`;

        const teacherEl = document.getElementById('order-teacher');
        if (teacherEl) teacherEl.value = 'Изменение заказа';

        const dateEl = document.getElementById('start-date');
        if (dateEl) {
            dateEl.innerHTML = '<option value="">Выберите дату</option>';
            const currentDate = order.date_start;
            const opt = document.createElement('option');
            opt.value = currentDate;
            opt.textContent = new Date(currentDate).toLocaleDateString('ru-RU');
            opt.selected = true;
            dateEl.appendChild(opt);

            populateTimes(currentDate);
        }

        const timeEl = document.getElementById('start-time');
        if (timeEl) timeEl.value = order.time_start || '';

        const personsEl = document.getElementById('persons');
        if (personsEl) personsEl.value = order.persons || 1;

        ['supplementary', 'personalized', 'excursions', 'assessment', 'interactive'].forEach(key => {
            const el = document.getElementById(key);
            if (el) el.checked = !!order[key];
        });

        document.getElementById('orderModalLabel').textContent = 'Редактирование заявки';

        calculateAndShowPrice();

        new bootstrap.Modal(document.getElementById('order-modal')).show();
    } catch (err) {
        showNotification('Ошибка при открытии редактирования: ' + err.message, 'danger');
    }
}

function confirmDeleteOrder(id) {
    if (!confirm('Удалить заявку №' + id + '?')) return;

    fetch(`${API_BASE}/orders/${id}?api_key=${appkkk}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                showNotification('Заявка удалена', 'success');
                loadOrders();
            } else {
                showNotification('Не удалось удалить', 'danger');
            }
        })
        .catch(err => showNotification('Ошибка удаления: ' + err.message, 'danger'));
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('courses-body')) {
        loadCourses();
        document.getElementById('search-courses-form')?.addEventListener('submit', e => {
            e.preventDefault();
            loadCourses(1, document.getElementById('search-course-name')?.value || '', document.getElementById('search-course-level')?.value || '');
        });
        document.getElementById('search-tutors-form')?.addEventListener('submit', e => {
            e.preventDefault();
            loadTutors(document.getElementById('search-tutor-qualification')?.value || '', document.getElementById('search-tutor-experience')?.value || '');
        });
    }

    if (document.getElementById('orders-body')) {
        loadOrders();
    }
});