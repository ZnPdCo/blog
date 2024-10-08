(() => {
  const rootElement = document.documentElement;
  const darkModeStorageKey = 'user-color-scheme';
  const darkModeMediaQueryKey = '--color-mode';
  const rootElementDarkModeAttributeName = 'data-user-color-scheme';

  const setLS = (k, v) => {
      try {
          localStorage.setItem(k, v);
      } catch (e) {}
  };

  const removeLS = (k) => {
      try {
          localStorage.removeItem(k);
      } catch (e) {}
  };

  const getLS = (k) => {
      try {
          return localStorage.getItem(k);
      } catch (e) {
          return null;
      }
  };

  const getModeFromCSSMediaQuery = () => {
      const res = getComputedStyle(rootElement).getPropertyValue(darkModeMediaQueryKey);
      if (res.length) return res.replace(/["'\s]/g, '');
      return res === 'dark' ? 'dark' : 'light';
  };

  const resetRootDarkModeAttributeAndLS = () => {
      rootElement.removeAttribute(rootElementDarkModeAttributeName);
      removeLS(darkModeStorageKey);
  };

  const validColorModeKeys = {
      dark: true,
      light: true,
  };

  const applyCustomDarkModeSettings = (mode) => {
      const currentSetting = mode || getLS(darkModeStorageKey);

      
      var iframe = document.querySelector('.giscus-frame');
      if (iframe) {
        var url = new URL(iframe.src);
        url.searchParams.set('theme', currentSetting);
        iframe.src = url.toString();
      }

      if (currentSetting === getModeFromCSSMediaQuery()) {
          resetRootDarkModeAttributeAndLS();
      } else if (validColorModeKeys[currentSetting]) {
          rootElement.setAttribute(rootElementDarkModeAttributeName, currentSetting);
      } else {
          resetRootDarkModeAttributeAndLS();
      }
  };

  const invertDarkModeObj = {
      dark: 'light',
      light: 'dark',
  };

  const toggleCustomDarkMode = () => {
      var currentSetting = getLS(darkModeStorageKey);

      if (validColorModeKeys[currentSetting]) {
          currentSetting = invertDarkModeObj[currentSetting];
      } else if (currentSetting === null) {
          currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
      } else {
          return;
      }
      setLS(darkModeStorageKey, currentSetting);

      return currentSetting;
  };

  applyCustomDarkModeSettings();

  window.onload = () => {
      const darkModeToggleBottonElement = document.getElementById('btn-toggle-dark');
      darkModeToggleBottonElement.addEventListener('click', () => {
          applyCustomDarkModeSettings(toggleCustomDarkMode());
      });
  };
})();
