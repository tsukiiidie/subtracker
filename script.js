// 1. Инициализация
let subscriptions = JSON.parse(localStorage.getItem('subs')) || [];

const listContainer = document.getElementById('subscriptionsList');
const emptyMessage = document.getElementById('emptyMessage');
const totalMonthEl = document.getElementById('totalMonth');
const totalYearEl = document.getElementById('totalYear');
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const form = document.getElementById('subscriptionForm');

// Названия месяцев для отображения
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

// 2. Открытие/закрытие модалки
openModalBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));

// 3. Добавление подписки
form.addEventListener('submit', (e) => {
	e.preventDefault();

	const newSub = {
		id: Date.now(),
		name: document.getElementById('name').value,
		cost: parseFloat(document.getElementById('cost').value),
		period: document.getElementById('period').value,
		nextDate: document.getElementById('nextDate').value,
		year: parseInt(document.getElementById('year').value), // Год отслеживания
		// Создаем массив из 12 нулей (0 - пусто, 1 - оплачено, 2 - пропущено)
		payments: new Array(12).fill(0)
	};

	subscriptions.push(newSub);
	saveAndRender();

	form.reset();
	modalOverlay.classList.remove('active');
});

// 4. Удаление подписки
function deleteSub(id) {
	if (confirm('Удалить эту подписку?')) {
		subscriptions = subscriptions.filter(sub => sub.id !== id);
		saveAndRender();
	}
}

// 5. Переключение статуса месяца (0 -> 1 -> 2 -> 0)
function toggleMonth(subId, monthIndex) {
	const sub = subscriptions.find(s => s.id === subId);
	if (!sub) return;

	// Циклическое переключение: 0 (пусто) -> 1 (оплачено) -> 2 (пропущено) -> 0
	sub.payments[monthIndex] = (sub.payments[monthIndex] + 1) % 3;

	saveAndRender();
}

// 6. Сохранение и отрисовка
function saveAndRender() {
	localStorage.setItem('subs', JSON.stringify(subscriptions));
	renderList();
	calculateTotals();
}

// 7. Отрисовка списка
function renderList() {
	listContainer.innerHTML = '';

	if (subscriptions.length === 0) {
		emptyMessage.style.display = 'block';
		return;
	}
	emptyMessage.style.display = 'none';

	subscriptions.forEach(sub => {
		const card = document.createElement('div');
		card.className = 'sub-card';

		const dateObj = new Date(sub.nextDate);
		const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
		const periodText = sub.period === 'monthly' ? 'мес' : 'год';

		// Генерируем HTML для сетки месяцев
		let monthsHtml = '';
		MONTHS.forEach((monthName, index) => {
			const status = sub.payments[index]; // 0, 1 или 2
			let statusClass = 'empty';
			let icon = monthName;

			if (status === 1) {
				statusClass = 'paid';
				icon = '✓'; // Галочка
			} else if (status === 2) {
				statusClass = 'skipped';
				icon = '✕'; // Крестик
			}

			monthsHtml += `
                <button 
                    class="month-btn ${statusClass}" 
                    onclick="toggleMonth(${sub.id}, ${index})"
                    title="${monthName} ${sub.year}"
                >
                    ${icon}
                </button>
            `;
		});

		card.innerHTML = `
            <div class="sub-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3>${sub.name} <span style="font-size:12px; color:#888;">(${sub.year})</span></h3>
                    <button class="btn-delete" onclick="deleteSub(${sub.id})" title="Удалить">✕</button>
                </div>
                <span class="sub-meta">Следующее списание: ${dateStr}</span>
                
                <div class="months-grid">
                    ${monthsHtml}
                </div>
            </div>
            <div class="sub-price" style="margin-top: 12px; text-align: right;">
                <span class="price-value">${sub.cost} ₽</span>
                <span class="price-date">/${periodText}</span>
            </div>
        `;
		listContainer.appendChild(card);
	});
}

// 8. Подсчет итогов
function calculateTotals() {
	let monthTotal = 0;
	let yearTotal = 0;

	subscriptions.forEach(sub => {
		if (sub.period === 'monthly') {
			monthTotal += sub.cost;
			yearTotal += sub.cost * 12;
		} else {
			monthTotal += sub.cost / 12;
			yearTotal += sub.cost;
		}
	});

	totalMonthEl.textContent = `${Math.round(monthTotal)} ₽`;
	totalYearEl.textContent = `${Math.round(yearTotal)} ₽`;
}

// Первый запуск
saveAndRender();