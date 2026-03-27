chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToNotes",
    title: "Сохранить в заметки",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveToNotes") {
    chrome.storage.local.get({ notes: [] }, (data) => {
      const newNote = {
        id: Date.now(), // Уникальный ID для точного удаления и поиска
        text: info.selectionText,
        date: new Date().toLocaleString(),
        url: tab.url
      };
      const updatedNotes = [...data.notes, newNote];
      chrome.storage.local.set({ notes: updatedNotes });
    });
  }
});