const { defer, from, Observable, of } = rxjs;
const { mergeMap, toArray } = rxjs.operators;

export const animationNames = [
  'slide',
  'rubber',
  'outBox',
  'zoom'
];

function displayed($element) {
  const { offsetParent } = $element;
  const { display } = window.getComputedStyle($element);

  return offsetParent && display !== 'none';
}

function animationStart($element) {
  const start$ = new Observable(subscriber => {
    $element.addEventListener('animationstart', _ => {
      subscriber.next($element);
      subscriber.complete();
    }, { once: true });
  });

  return start$;
}

export function animateElement({ $elements: $element, animationName, loop, mediaQuery }) {
  const element$ = defer(() => {
    $element.classList.remove('hide-animation');

    if (!displayed($element) || mediaQuery && !mediaQuery.matches) {
      return of($element);
    }

    const animationClass = `animate_${ animationName }`;
    $element.classList.add(animationClass);

    if (loop) {
      $element.classList.add('loop');
    } else {
      $element.addEventListener('animationend', _ =>
        $element.classList.remove(animationClass),
      { once: true });
    }

    return animationStart($element);
  });

  return element$;
}

const isElementsArray = ({ $elements }) => Array.isArray($elements);

export default function animate(...elements) {
  const animationsStart$ = from(elements)
    .pipe(
      mergeMap(element => !isElementsArray(element) ?
        animateElement(element) :
        from(element.$elements)
          .pipe(
            mergeMap($element =>
              animateElement({ ...element, ...{ $elements: $element } })))),
      toArray());

  return animationsStart$;
}
