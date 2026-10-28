export function renderPage(host) {
  const section = document.createElement('section');
  section.className = 'pending-page';
  const label = document.createElement('span');
  label.className = 'eyebrow';
  label.textContent = '04 / UNDEFINED';
  section.append(label);
  host.replaceChildren(section);
}
