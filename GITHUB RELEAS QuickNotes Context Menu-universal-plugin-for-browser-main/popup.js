document.addEventListener('DOMContentLoaded', () => {
    const notesList = document.getElementById('notesList');
    const sortBtn = document.getElementById('sortNotes');
    const exportBtn = document.getElementById('exportNotes');
    const clearBtn = document.getElementById('clearNotes');

    let isReversed = true; // По умолчанию новые сверху

    // Функция отрисовки заметок
    function renderNotes() {
        chrome.storage.local.get({ notes: [] }, (data) => {
            notesList.innerHTML = '';
            let notes = [...data.notes];

            // Сортировка
            if (isReversed) {
                notes.sort((a, b) => b.id - a.id); // Новые первые
            } else {
                notes.sort((a, b) => a.id - b.id); // Старые первые
            }

            if (notes.length === 0) {
                notesList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Заметок пока нет</p>';
                return;
            }

            notes.forEach((note) => {
                const div = document.createElement('div');
                div.className = 'note';
                div.innerHTML = `
                    <button class="delete-btn" data-id="${note.id}">&times;</button>
                    <div class="note-text" contenteditable="true" data-id="${note.id}">${note.text}</div>
                    <span class="note-date">${note.date}</span>
                `;
                notesList.appendChild(div);
            });
        });
    }

    // Удаление конкретной заметки по ID
    notesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idToDelete = parseInt(e.target.getAttribute('data-id'));
            chrome.storage.local.get({ notes: [] }, (data) => {
                const filteredNotes = data.notes.filter(n => n.id !== idToDelete);
                chrome.storage.local.set({ notes: filteredNotes }, renderNotes);
            });
        }
    });

    // Автосохранение при редактировании по ID
    notesList.addEventListener('input', (e) => {
        if (e.target.classList.contains('note-text')) {
            const idToEdit = parseInt(e.target.getAttribute('data-id'));
            const newText = e.target.innerText;

            chrome.storage.local.get({ notes: [] }, (data) => {
                const noteIndex = data.notes.findIndex(n => n.id === idToEdit);
                if (noteIndex !== -1) {
                    data.notes[noteIndex].text = newText;
                    chrome.storage.local.set({ notes: data.notes });
                }
            });
        }
    });

    // Переключение сортировки
    sortBtn.addEventListener('click', () => {
        isReversed = !isReversed;
        renderNotes();
    });

    // Экспорт в TXT
    exportBtn.addEventListener('click', () => {
        chrome.storage.local.get({ notes: [] }, (data) => {
            if (data.notes.length === 0) return alert("Нечего скачивать");
            
            let content = "ВАШИ ЗАМЕТКИ\n" + "=".repeat(20) + "\n\n";
            data.notes.forEach((n, i) => {
                content += `${i+1}. [${n.date}]\n${n.text}\nИсточник: ${n.url}\n\n`;
            });

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notes_${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Очистить всё
    clearBtn.addEventListener('click', () => {
        if (confirm("Удалить все заметки навсегда?")) {
            chrome.storage.local.set({ notes: [] }, renderNotes);
        }
    });

    // Первый запуск
    renderNotes();
});