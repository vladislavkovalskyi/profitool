export const THEME_KEY = "profitool-theme";

/**
 * Ставит data-theme на <html> до первой отрисовки. Без сохранённого выбора атрибута нет,
 * и работает тёмная тема: чёрный фон это лицо магазина, светлая включается кнопкой.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
