// This file contains the spark-specific plugins for the sidekick.
(() => {
  const sk = window.hlx && window.hlx.sidekick ? window.hlx.sidekick : window.hlxSidekick;
  if (typeof sk !== 'object') return;

  // TEMPLATES --------------------------------------------------------------------

  sk.add({
    id: 'templates',
    condition: (sk) => sk.isEditor() && (sk.location.search.includes('.docx&') || sk.location.search.includes('.md&')),
    button: {
      text: 'Templates',
      action: () => {
        const { config, location } = sk;
        window.open(`https://${config.host || location.host}/tools/templates/picker.html`, 'hlx-sidekick-spark-templates');
      },
    },
  });

})();
