export const animationNames = [
  'slide',
  'rubber',
  'outBox',
  'zoom'
];

export default function animate(...sources) {
  for (const { $el, name, loop } of sources) {
    if (!animationNames.some(a => a === name)) {
      continue;
    }
    if (Array.isArray($el)) {
      const animateRecursion = $el.map($el => {
        return { $el, name, loop };
      });
      animate(...animateRecursion);
      continue;
    }
    const animation = `animate_${ name }`;
    $el.classList.add(animation);
    if (loop) {
      $el.classList.add('loop');
    } else {
      $el.addEventListener('animationend', () =>
        $el.classList.remove(animation),
        { once: true });
    }
  }
}
