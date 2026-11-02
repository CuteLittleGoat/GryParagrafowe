// Okna dialogowe aplikacji (element <dialog>: obsługa klawiatury, Escape i powrót fokusu).
// Wszystkie teksty w oknach to komunikaty aplikacji — nie tekst książki.

import { h } from './dom.js';

let counter = 0;

// Otwiera okno; zwraca obietnicę z identyfikatorem wybranej akcji albo null (Escape / Zamknij).
// actions: [{ id, label, kind: 'primary' | 'danger' | undefined }]
export function openDialog({ title, body = [], actions = [{ id: 'close', label: 'Zamknij' }], wide = false, onOpen }) {
  const titleId = `dialog-title-${++counter}`;
  const opener = document.activeElement;
  const dialog = h(
    'dialog',
    { class: wide ? 'app-dialog app-dialog-wide' : 'app-dialog', 'aria-labelledby': titleId },
    h(
      'div',
      { class: 'dialog-header' },
      h('h2', { id: titleId, class: 'dialog-title' }, title),
      h('button', { type: 'button', class: 'btn btn-quiet dialog-x', 'aria-label': 'Zamknij okno', value: '' }, '✕'),
    ),
    h('div', { class: 'dialog-body' }, body),
    actions.length
      ? h(
        'div',
        { class: 'dialog-actions' },
        actions.map((action) =>
          h('button', { type: 'button', class: `btn ${action.kind ? `btn-${action.kind}` : ''}`, value: action.id }, action.label)),
      )
      : null,
  );
  document.body.append(dialog);
  return new Promise((resolve) => {
    let result = null;
    dialog.addEventListener('click', (event) => {
      const button = event.target.closest('button[value]');
      if (button && dialog.contains(button) && (button.closest('.dialog-actions') || button.classList.contains('dialog-x'))) {
        result = button.value || null;
        dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (opener && document.contains(opener)) opener.focus();
      resolve(result);
    });
    dialog.showModal();
    onOpen?.(dialog);
  });
}

export async function confirmDialog({ title, message, confirmLabel = 'Tak', cancelLabel = 'Anuluj', danger = false }) {
  const result = await openDialog({
    title,
    body: [message].flat().map((text) => (text instanceof Node ? text : h('p', {}, text))),
    actions: [
      { id: 'confirm', label: confirmLabel, kind: danger ? 'danger' : 'primary' },
      { id: 'cancel', label: cancelLabel },
    ],
  });
  return result === 'confirm';
}

export async function alertDialog({ title, message }) {
  await openDialog({
    title,
    body: [message].flat().map((text) => (text instanceof Node ? text : h('p', {}, text))),
    actions: [{ id: 'ok', label: 'OK', kind: 'primary' }],
  });
}

// Pole tekstowe w oknie (np. nazwa zapisu). Zwraca wpisany tekst albo null.
export async function promptDialog({ title, label, value = '', confirmLabel = 'Zapisz', maxLength = 60 }) {
  const input = h('input', { type: 'text', value, maxlength: maxLength, class: 'input' });
  const result = await openDialog({
    title,
    body: [h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), input)],
    actions: [
      { id: 'confirm', label: confirmLabel, kind: 'primary' },
      { id: 'cancel', label: 'Anuluj' },
    ],
    onOpen: (dialog) => {
      input.focus();
      input.select();
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          dialog.querySelector('button[value="confirm"]').click();
        }
      });
    },
  });
  return result === 'confirm' ? input.value.trim() : null;
}
