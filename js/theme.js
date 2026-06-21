const KEY = 'munitwin-theme';

function getTheme() {
  return document.documentElement.dataset.theme || 'light';
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
  syncIcons(theme);
}

function syncIcons(theme) {
  document.querySelectorAll('.icon-moon').forEach(el =>
    el.classList.toggle('hidden', theme !== 'light'));
  document.querySelectorAll('.icon-sun').forEach(el =>
    el.classList.toggle('hidden', theme !== 'dark'));
}

document.querySelectorAll('.theme-toggle').forEach(btn =>
  btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark')));

syncIcons(getTheme());
