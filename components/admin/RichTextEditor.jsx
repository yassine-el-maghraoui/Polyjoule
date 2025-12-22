'use client';

import { useEffect, useRef } from 'react';

const FONT_OPTIONS = [
  { label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
];

const SIZE_OPTIONS = [
  { label: 'Petit', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Grand', value: '4' },
  { label: 'Très grand', value: '5' },
];

const BLOCK_OPTIONS = [
  { label: 'Paragraphe', value: 'P' },
  { label: 'Titre', value: 'H2' },
  { label: 'Sous-titre', value: 'H3' },
];

function applyCommand(command, value = null) {
  document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const updateValue = () => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html === '<br>' ? '' : html);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleCommand = (command, commandValue = null) => {
    focusEditor();
    applyCommand(command, commandValue);
    updateValue();
  };

  const handleLink = () => {
    const url = window.prompt('Lien (https://...)');
    if (!url) return;
    handleCommand('createLink', url);
  };

  const keepSelection = (event) => {
    event.preventDefault();
  };

  return (
    <div className="rich-text">
      <div className="rich-text-toolbar">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Annuler"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('undo')}
        >
          <i className="ri-arrow-go-back-line" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Rétablir"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('redo')}
        >
          <i className="ri-arrow-go-forward-line" />
        </button>

        <select
          className="form-select form-select-sm rich-text-select"
          defaultValue={FONT_OPTIONS[0].value}
          onMouseDown={keepSelection}
          onChange={(event) => handleCommand('fontName', event.target.value)}
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm rich-text-select"
          defaultValue={BLOCK_OPTIONS[0].value}
          onMouseDown={keepSelection}
          onChange={(event) => handleCommand('formatBlock', event.target.value)}
        >
          {BLOCK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm rich-text-select"
          defaultValue={SIZE_OPTIONS[1].value}
          onMouseDown={keepSelection}
          onChange={(event) => handleCommand('fontSize', event.target.value)}
        >
          {SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Gras"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('bold')}
        >
          <i className="ri-bold" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Italique"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('italic')}
        >
          <i className="ri-italic" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Souligné"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('underline')}
        >
          <i className="ri-underline" />
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Aligner à gauche"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('justifyLeft')}
        >
          <i className="ri-align-left" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Centrer"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('justifyCenter')}
        >
          <i className="ri-align-center" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Aligner à droite"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('justifyRight')}
        >
          <i className="ri-align-right" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Justifier"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('justifyFull')}
        >
          <i className="ri-align-justify" />
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Liste à puces"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('insertUnorderedList')}
        >
          <i className="ri-list-unordered" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Liste numérotée"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('insertOrderedList')}
        >
          <i className="ri-list-ordered" />
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Lien"
          onMouseDown={keepSelection}
          onClick={handleLink}
        >
          <i className="ri-link" />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          title="Nettoyer la mise en forme"
          onMouseDown={keepSelection}
          onClick={() => handleCommand('removeFormat')}
        >
          <i className="ri-eraser-line" />
        </button>

        <label className="rich-text-color" title="Couleur du texte" onMouseDown={keepSelection}>
          <input
            type="color"
            onChange={(event) => {
              handleCommand('foreColor', event.target.value);
            }}
          />
          <span>Couleur</span>
        </label>
        <label className="rich-text-color" title="Surligner" onMouseDown={keepSelection}>
          <input
            type="color"
            onChange={(event) => {
              handleCommand('hiliteColor', event.target.value);
            }}
          />
          <span>Surligner</span>
        </label>
      </div>

      <div
        ref={editorRef}
        className="form-control rich-text-editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={updateValue}
        onBlur={updateValue}
      />
    </div>
  );
}
