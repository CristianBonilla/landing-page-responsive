export const animationNames = [
  'slide',
  'rubber',
  'outBox',
  'zoom'
];

export function animateByElement($element, name, loop) {
  const animation = `animate_${ name }`;
  $element.classList.add(animation);
  if (loop) {
    $element.classList.add('loop');
  } else {
    $element.addEventListener('animationend', _ =>
      $element.classList.remove(animation),
      { once: true });
  }
}

export function animate(...sources) {
  for (const { $el, name, loop, mediaQuery } of sources) {
    if (Array.isArray($el)) {
      const recursion = $el.map($el => {
        return { $el, name, loop };
      });
      animate(...recursion);
      continue;
    }

    if (!mediaQuery || mediaQuery && mediaQuery.matches) {
      animateByElement($el, name, loop);
    }
  }
}
