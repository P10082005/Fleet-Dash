// services/astRenderer.js

// Escape plain text so it can't break HTML or inject tags
function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Render a single AST node recursively
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
          <body>
            ${childrenHtml}
          </body>
        </html>
      `;

    case 'heading': {
      const level = node.level || 1;
      const safeLevel = Math.min(Math.max(level, 1), 6);
      return `<h${safeLevel}>${escapeText(node.text || '')}</h${safeLevel}>`;
    }

    case 'paragraph':
      return `<p>${escapeText(node.text || '')}</p>`;

    case 'code_block': {
      const langClass = node.language
        ? ` class="language-${escapeText(node.language)}"`
        : '';
      return `<pre><code${langClass}>${escapeText(node.code || '')}</code></pre>`;
    }

    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul';
      return `<${tag}>${childrenHtml}</${tag}>`;
    }

    case 'list_item':
      return `<li>${childrenHtml}</li>`;

    case 'bold':
      return `<strong>${childrenHtml}</strong>`;

    case 'italic':
      return `<em>${childrenHtml}</em>`;

    case 'link': {
      const href = escapeText(node.href || '#');
      const label = childrenHtml || escapeText(node.text || '');
      return `<a href="${href}">${label}</a>`;
    }

    case 'text':
      return escapeText(node.value || '');

    default:
      // Ignore unknown node types, but keep children
      return childrenHtml;
  }
}

// Public API: render entire document AST
function renderDocument(astRoot) {
  if (!astRoot || astRoot.type !== 'document') {
    astRoot = {
      type: 'document',
      title: astRoot?.title || 'SyncDoc Document',
      children: Array.isArray(astRoot?.children)
        ? astRoot.children
        : astRoot ? [astRoot] : [],
    };
  }

  return renderNode(astRoot);
}

module.exports = {
  renderDocument,
};