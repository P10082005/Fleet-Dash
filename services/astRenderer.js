// services/astRenderer.js

// Helper: escape plain text so <, &, " don't break HTML
function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Core: render a single AST node to HTML
function renderNode(node) {
  if (!node || !node.type) {
    return '';
  }

  const childrenHtml = Array.isArray(node.children)
    ? node.children.map(renderNode).join('')
    : '';

  switch (node.type) {
    case 'document':
      // root node: wrap in a minimal HTML shell
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
      const level = node.level || 1; // 1-6
      const safeLevel = Math.min(Math.max(level, 1), 6);
      return `<h${safeLevel}>${escapeText(node.text || '')}</h${safeLevel}>`;
    }

    case 'paragraph':
      return `<p>${escapeText(node.text || '')}</p>`;

    case 'code_block': {
      const langClass = node.language ? ` class="language-${escapeText(node.language)}"` : '';
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
      return `<a href="${href}">${childrenHtml || escapeText(node.text || '')}</a>`;
    }

    case 'text':
      // a pure text node (inline)
      return escapeText(node.value || '');

    // fallback: ignore unknown node types instead of rendering unsafe HTML
    default:
      return childrenHtml;
  }
}

// Public API: render whole document AST
function renderDocument(astRoot) {
  // If root is not explicitly a "document" node, wrap it
  if (!astRoot || astRoot.type !== 'document') {
    astRoot = {
      type: 'document',
      title: astRoot?.title || 'SyncDoc Document',
      children: Array.isArray(astRoot?.children) ? astRoot.children : [astRoot],
    };
  }

  return renderNode(astRoot);
}

module.exports = {
  renderDocument,
};