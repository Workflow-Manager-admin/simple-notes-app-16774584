import React, { useState, useEffect } from "react";
import "./App.css";

// Helpers to work with localStorage or a backend API if needed via env
const NOTES_STORAGE_KEY = process.env.REACT_APP_NOTES_KEY || "notesapp_notes";

// Util: load notes - using localStorage for now, but pluggable for API fetch if required
function loadNotes() {
  try {
    const data = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Util: save notes to storage
function saveNotes(notes) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

// PUBLIC_INTERFACE
export default function App() {
  // Notes state
  const [notes, setNotes] = useState([]);
  // Selected note id for viewing/editing
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  // Editor state
  const [editorState, setEditorState] = useState({
    title: "",
    content: "",
    isEditing: false,
  });
  // Sidebar state (for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme (light/minimalist, with ability to extend)
  // Colors: primary (#1976d2), secondary (#424242), accent (#ffb300)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light"); // always light
  }, []);

  // Load notes from storage on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // Save to storage anytime notes change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // When selecting a new note id, update editor state accordingly
  useEffect(() => {
    if (selectedNoteId === null) {
      setEditorState({ title: "", content: "", isEditing: false });
    } else {
      const note = notes.find((n) => n.id === selectedNoteId);
      if (note) {
        setEditorState({
          title: note.title,
          content: note.content,
          isEditing: false,
        });
      }
    }
  }, [selectedNoteId, notes]);

  // PUBLIC_INTERFACE
  function handleCreateClick() {
    setSelectedNoteId(null);
    setEditorState({ title: "", content: "", isEditing: true });
    setSidebarOpen(false);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    if (editorState.title.trim() === "" && editorState.content.trim() === "") {
      return;
    }
    if (selectedNoteId === null) {
      // Create new
      const newNote = {
        id: Date.now().toString(),
        title: editorState.title.trim() || "Untitled",
        content: editorState.content.trim(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    } else {
      // Update existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNoteId
            ? {
                ...n,
                title: editorState.title.trim() || "Untitled",
                content: editorState.content.trim(),
                updated: new Date().toISOString(),
              }
            : n
        )
      );
    }
    setEditorState((s) => ({ ...s, isEditing: false }));
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (!window.confirm("Delete this note?")) return;
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setEditorState({ title: "", content: "", isEditing: false });
    }
  }

  // PUBLIC_INTERFACE
  function handleEditClick() {
    setEditorState((es) => ({ ...es, isEditing: true }));
  }

  // PUBLIC_INTERFACE
  function handleNoteSelect(id) {
    setSelectedNoteId(id);
    setSidebarOpen(false);
  }

  // PUBLIC_INTERFACE
  function handleEditorChange(e) {
    const { name, value } = e.target;
    setEditorState((es) => ({
      ...es,
      [name]: value,
    }));
  }

  // For minimal look, track window width for responsive sidebar
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth >= 900);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // PUBLIC_INTERFACE
  function Sidebar({ open }) {
    return (
      <nav
        className={`sidebar${open ? " open" : ""}`}
        aria-label="Notes sidebar"
      >
        <div className="sidebar-header">
          <div className="brand-title">🗒 SimpleNotes</div>
          <button
            className="new-note-btn"
            onClick={handleCreateClick}
            aria-label="Create new note"
            title="Create new note"
          >
            + New
          </button>
        </div>
        <ul className="notes-list">
          {notes.length === 0 && (
            <li className="notes-list-empty">No notes yet.</li>
          )}
          {notes.map((note) => (
            <li
              key={note.id}
              className={`notes-list-item${
                selectedNoteId === note.id ? " selected" : ""
              }`}
            >
              <button
                className="note-title-btn"
                onClick={() => handleNoteSelect(note.id)}
                title={note.title}
              >
                {note.title || "Untitled"}
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNote(note.id)}
                aria-label="Delete note"
                title="Delete note"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // PUBLIC_INTERFACE
  function MainArea() {
    // New Note Mode
    if (selectedNoteId == null && editorState.isEditing)
      return (
        <section className="main-content">
          <h2 className="main-title">New Note</h2>
          <NoteEditor
            title={editorState.title}
            content={editorState.content}
            onChange={handleEditorChange}
            onSave={handleSaveNote}
            onCancel={() => {
              setEditorState({ title: "", content: "", isEditing: false });
              setSelectedNoteId(null);
            }}
          />
        </section>
      );

    // No note selected, show instructions
    if (selectedNoteId == null)
      return (
        <section className="main-content empty">
          <div className="placeholder">
            <h2>Welcome!</h2>
            <p>Select a note or create a new one.</p>
          </div>
        </section>
      );

    // Find selected note
    const note = notes.find((n) => n.id === selectedNoteId);
    if (!note)
      return (
        <section className="main-content empty">
          <div className="placeholder">
            <h2>Note not found</h2>
          </div>
        </section>
      );

    // Editing selected note
    if (editorState.isEditing)
      return (
        <section className="main-content">
          <h2 className="main-title">Edit Note</h2>
          <NoteEditor
            title={editorState.title}
            content={editorState.content}
            onChange={handleEditorChange}
            onSave={handleSaveNote}
            onCancel={() => {
              setEditorState({
                title: note.title,
                content: note.content,
                isEditing: false,
              });
            }}
          />
        </section>
      );

    // Show note details
    return (
      <section className="main-content">
        <div className="note-detail-header">
          <h2 className="main-title">{note.title || "Untitled"}</h2>
          <div>
            <button
              className="edit-btn"
              onClick={handleEditClick}
              title="Edit note"
            >
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDeleteNote(note.id)}
              title="Delete note"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="note-detail-content">
          <pre>
            {note.content
              ? note.content
              : <span className="note-placeholder">No content.</span>}
          </pre>
        </div>
        <div className="note-detail-meta">
          <span>
            Created: {new Date(note.created).toLocaleString()}
          </span>
          <span>
            Updated: {new Date(note.updated).toLocaleString()}
          </span>
        </div>
      </section>
    );
  }

  // PUBLIC_INTERFACE
  function NoteEditor({ title, content, onChange, onSave, onCancel }) {
    return (
      <form
        className="note-editor"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        autoComplete="off"
      >
        <input
          type="text"
          name="title"
          className="note-title-input"
          placeholder="Title"
          value={title}
          onChange={onChange}
          maxLength={100}
          autoFocus
        />
        <textarea
          name="content"
          className="note-content-input"
          placeholder="Write your note…"
          rows={10}
          value={content}
          onChange={onChange}
        />
        <div className="editor-actions">
          <button type="submit" className="save-btn" title="Save">Save</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            title="Cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Hamburger for mobile sidebar toggling
  function HamburgerButton() {
    return (
      <button
        className="hamburger-btn"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        onClick={() => setSidebarOpen((p) => !p)}
      >
        <span />
        <span />
        <span />
      </button>
    );
  }

  return (
    <div className="notes-app-root">
      <Sidebar open={sidebarOpen} />
      {!sidebarOpen && (
        <HamburgerButton />
      )}
      <main className="main-area" aria-live="polite">
        <MainArea />
      </main>
    </div>
  );
}
