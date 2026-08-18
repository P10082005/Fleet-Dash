function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderNode(node) {
  if (!node || !node.type) return '';

  const childrenHtml = Array.isArray(node.children)
    ? node.children.map(renderNode).join('')
    : '';

  switch (node.type) {
    case 'document':
      return `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${escapeText(node.title || 'SyncDoc Document')}</title>
          </head>
          <body>${childrenHtml}</body>
        </html>
      `;

    case 'heading': {
      const level = Math.min(Math.max(node.level || 1, 1), 6);
      return `<h${level}>${escapeText(node.text || '')}</h${level}>`;
    }

    case 'paragraph':
      return `<p>${escapeText(node.text || '')}</p>`;

    case 'code_block': {
      const lang = node.language ? ` class="language-${escapeText(node.language)}"` : '';
      return `<pre><code${lang}>${escapeText(node.code || '')}</code></pre>`;
    }

    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul';
      return `<${tag}>${childrenHtml}</${tag}>`;
    }

    case 'list_item':
      return `<li>${childrenHtml}</li>`;

    case 'text':
      return escapeText(node.value || '');

    default:
      return childrenHtml;
  }
}

function renderDocument(astRoot) {
  if (!astRoot || astRoot.type !== 'document') {
    astRoot = {
      type: 'document',
      title: astRoot?.title || 'SyncDoc Document',
      children: Array.isArray(astRoot?.children) ? astRoot.children : [],
    };
  }
  return renderNode(astRoot);
}

module.exports = { renderDocument };