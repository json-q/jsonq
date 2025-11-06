const currentTheme = localStorage.getItem("theme");

function getPreferTheme() {
  if (currentTheme) return currentTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let themeValue = getPreferTheme();

function setPreference() {
  localStorage.setItem("theme", themeValue);
  reflectPreference();
}

reflectPreference();

window.onload = () => {
  function setThemeFeature() {
    reflectPreference();

    document.querySelector("#theme-btn")?.addEventListener("click", () => {
      themeValue = themeValue === "light" ? "dark" : "light";
      setPreference();
    });
  }

  setThemeFeature();

  // https://docs.astro.build/en/reference/modules/astro-transitions/#astroafter-swap-event
  document.addEventListener("astro:after-swap", setThemeFeature);
};

function reflectPreference() {
  // html data-theme attribute
  document.firstElementChild.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  const body = document.body;

  if (body) {
    const computedStyles = window.getComputedStyle(body);

    const bgColor = computedStyles.backgroundColor;

    // <meta theme-color ... />
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
}
