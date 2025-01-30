// public/runtime-env.js
(function () {
    const publicUrl = process.env.PUBLIC_URL || '/';
    const baseTag = document.querySelector('base');
    if (baseTag) {
      baseTag.setAttribute('href', publicUrl);
    }
  })();