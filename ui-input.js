/* Shared by deferred scripts and dynamically loaded page modules. */
globalThis.siteUI = {
  createTerminalInput({prompt, placeholder, label, submitLabel, type = 'text', id, value = '', className = ''}) {
    const form = document.createElement('form');
    form.className = `terminal-input ${className}`.trim();
    const prefix = document.createElement('span');
    prefix.className = 'terminal-input-prompt';
    prefix.textContent = prompt;
    prefix.setAttribute('aria-hidden', 'true');
    const entry = document.createElement('span');
    entry.className = 'terminal-input-entry';
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.value = value;
    input.setAttribute('aria-label', label);
    if (id) input.id = id;
    const cursor = document.createElement('span');
    cursor.className = 'terminal-input-cursor';
    cursor.textContent = '\u258c';
    cursor.setAttribute('aria-hidden', 'true');
    const submit = document.createElement('button');
    submit.className = 'terminal-input-submit';
    submit.type = 'submit';
    submit.textContent = '\u21b5';
    submit.setAttribute('aria-label', submitLabel);
    entry.append(input, cursor);
    form.append(prefix, entry, submit);
    const syncValue = () => form.classList.toggle('has-value', Boolean(input.value));
    input.addEventListener('input', syncValue);
    let composing = false;
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; syncValue(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (composing || event.isComposing) event.stopImmediatePropagation();
    });
    syncValue();
    return {form, input, syncValue};
  }
};
