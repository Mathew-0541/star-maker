(function (root) {
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ko', { granularity: 'grapheme' }) : null;
  const letters = text => segmenter ? Array.from(segmenter.segment(text), s => s.segment) : Array.from(text);
  function layoutText(text, size, direction, box, measure) {
    if (!text) return { items: [], overflow: false };
    const step = size * 1.25;
    const lines = [];
    const vertical = direction === 'vertical';
    const capacity = Math.max(1, Math.floor((box.height - size) / step) + 1);
    for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
      let line = [];
      for (const char of letters(paragraph)) {
        if (line.length && (vertical ? line.length >= capacity : measure(line.join('') + char) > box.width)) {
          lines.push(line);
          line = [];
        }
        line.push(char);
      }
      lines.push(line);
    }
    const extent = (lines.length - 1) * step + size;
    const items = [];
    let overflow = extent > (vertical ? box.width : box.height);
    if (vertical) {
      const maxLength = Math.max(...lines.map(l => l.length));
      const height = Math.max(0, (maxLength - 1) * step + size);
      overflow ||= height > box.height;
      const top = box.y + (box.height - height) / 2 + size / 2;
      const right = box.x + box.width / 2 + (lines.length - 1) * step / 2;
      lines.forEach((line, col) => line.forEach((char, row) => {
        overflow ||= measure(char) > size * 1.25;
        items.push({ text: char, x: right - col * step, y: top + row * step });
      }));
    } else {
      const top = box.y + (box.height - extent) / 2 + size / 2;
      lines.forEach((line, row) => {
        const value = line.join('');
        overflow ||= measure(value) > box.width;
        items.push({ text: value, x: box.x + box.width / 2, y: top + row * step });
      });
    }
    return { items, overflow };
  }
  const api = { layoutText };
  if (typeof module !== 'undefined') module.exports = api;
  else root.StarLayout = api;
})(globalThis);
