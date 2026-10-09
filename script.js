
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllButton = document.querySelector("#clear-all-button");

const STORAGE_KEY = "quicknotes-notes";

let notes = [];

function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (!savedNotes) return [];

    const parsedNotes = JSON.parse(savedNotes);
    if (!Array.isArray(parsedNotes)) return [];

    return parsedNotes.filter(note =>
      note &&
      typeof note.id === "string" &&
      typeof note.text === "string" &&
      note.text.trim().length > 0 &&
      note.text.length <= 200 &&
      ["Personal", "Work", "Study"].includes(note.category) &&
      typeof note.createdAt === "string"
    );
  } catch (error) {
    console.error("Could not load notes:", error);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    errorMessage.textContent = "Could not save notes in this browser.";
  }
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

function render() {
  notesList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchTerm)
  );

  if (filteredNotes.length === 0) {
    const message = document.createElement("li");
    message.className = "empty-message";
    message.textContent = searchTerm
      ? "No notes match your search."
      : "No notes yet. Add your first note above.";

    notesList.appendChild(message);
  }

  filteredNotes.forEach(note => {
    const item = document.createElement("li");
    item.classList.add(
      "note-card",
      `category-${note.category.toLowerCase()}`
    );

    const text = document.createElement("p");
    text.className = "note-text";
    text.textContent = note.text;

    const meta = document.createElement("div");
    meta.className = "note-meta";

    const category = document.createElement("span");
    category.className = "category-label";
    category.textContent = note.category;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id);
    });

    const date = document.createElement("small");
    date.className = "note-date";
    date.textContent = `Created: ${note.createdAt}`;

    meta.append(category, deleteButton);
    item.append(text, meta, date);
    notesList.appendChild(item);
  });

  updateCount();
}

function addNote(text, category) {
  const note = {
    id: crypto.randomUUID(),
    text,
    category,
    createdAt: new Date().toLocaleString()
  };

  notes.unshift(note);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  render();
}

noteForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = noteInput.value.trim();
  const category = noteCategory.value;

  if (text.length === 0) {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  if (!["Personal", "Work", "Study"].includes(category)) {
    errorMessage.textContent = "Please select a valid category.";
    return;
  }

  errorMessage.textContent = "";
  addNote(text, category);

  noteInput.value = "";
  noteInput.focus();
});

searchInput.addEventListener("input", render);

clearAllButton.addEventListener("click", () => {
  if (notes.length > 0 && confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
    errorMessage.textContent = "";
  }
});

notes = loadNotes();
render();

