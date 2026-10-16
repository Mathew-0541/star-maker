'use strict';
const canvas = document.querySelector('#preview');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const download = document.querySelector('#download');
const saved = document.querySelector('#saved');
const image = new Image();
const boxes = { left: { x: 52, y: 38, width: 101, height: 94 }, right: { x: 420, y: 28, width: 94, height: 120 } };
const state = { left: 'horizontal', right: 'horizontal' };
let ready = false;
let hasOverflow = false;
const fontFamily = '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
function render() {
  if (!ready) return;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, 525, 369);
  ctx.drawImage(image, 0, 0, 525, 369);
  hasOverflow = false;
  for (const side of ['left', 'right']) {
    const text = document.getElementById(`${side}-text`).value;
    const size = Number(document.getElementById(`${side}-size`).value);
    document.getElementById(`${side}-size-value`).innerHTML = `${size} <small>px</small>`;
    ctx.font = `900 ${size}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#191919';
    const box = boxes[side];
    const layout = StarLayout.layoutText(text, size, state[side], box, value => ctx.measureText(value).width);
    document.getElementById(`${side}-warning`).hidden = !layout.overflow;
    hasOverflow ||= layout.overflow;
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.clip();
    for (const item of layout.items) ctx.fillText(item.text, item.x, item.y);
    ctx.restore();
  }
  download.disabled = hasOverflow;
  status.textContent = hasOverflow ? '대사가 잘리지 않도록 크기나 내용을 조절한 뒤 저장해 주세요.' : '마음에 들면 이미지로 저장해 보세요.';
}
function changed() { saved.hidden = true; render(); }
for (const side of ['left', 'right']) {
  document.getElementById(`${side}-text`).addEventListener('input', changed);
  document.getElementById(`${side}-size`).addEventListener('input', changed);
}
document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('click', () => {
    const side = button.dataset.side;
    state[side] = button.dataset.direction;
    document.querySelectorAll(`[data-side="${side}"]`).forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    changed();
  });
});
document.querySelector('#reset').addEventListener('click', () => {
  for (const side of ['left', 'right']) {
    document.getElementById(`${side}-text`).value = '';
    document.getElementById(`${side}-size`).value = 19;
    state[side] = 'horizontal';
    document.querySelectorAll(`[data-side="${side}"]`).forEach(option => option.setAttribute('aria-pressed', String(option.dataset.direction === 'horizontal')));
  }
  changed();
  document.querySelector('#left-text').focus();
});
download.addEventListener('click', () => {
  if (!ready || hasOverflow) return;
  try {
    render();
    const url = canvas.toDataURL('image/png');
    document.querySelector('#saved-image').src = url;
    const link = document.querySelector('#save-link');
    link.href = url;
    link.download = `star-${new Date().toISOString().slice(0, 10)}.png`;
    saved.hidden = false;
    link.click();
    status.textContent = '저장용 이미지를 만들었어요. 아래에서도 확인할 수 있어요.';
  } catch {
    status.textContent = '저장하지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.';
  }
});
image.onload = async () => {
  if (document.fonts) await document.fonts.ready;
  ready = true;
  render();
};
image.onerror = () => { status.textContent = '원본 이미지를 불러오지 못했어요. 새로고침해 주세요.'; };
image.src = 'assets/STAR.png';
