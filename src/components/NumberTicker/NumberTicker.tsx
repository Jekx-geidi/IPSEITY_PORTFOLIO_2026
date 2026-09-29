import { useMotionPreference } from '../PortfolioMotion/useMotionPreference';
// NumberTicker — adapted from Magic UI (https://magicui.design/docs/components/number-ticker), MIT.
// Changes: no `cn` helper / default colours (callers style it), and a `minIntegerDigits`
// option so values like "05" keep their leading zero.
import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
  minIntegerDigits?: number;
}

export default function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  className = '',
  decimalPlaces = 0,
  minIntegerDigits = 1,
  ...props
}: NumberTickerProps) {
  const reduced = useMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const format = (n: number) =>
    Intl.NumberFormat('en-US', {
      minimumIntegerDigits: minIntegerDigits,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)));

  useEffect(() => {
    if (reduced) {
      if (ref.current) ref.current.textContent = format(direction === 'down' ? startValue : value);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? startValue : value);
      }, delay * 1000);
    }
    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [motionValue, isInView, delay, value, direction, startValue, reduced]);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current && !reduced) ref.current.textContent = format(latest);
      }),
    [springValue, decimalPlaces, minIntegerDigits, reduced] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <span ref={ref} aria-label={format(value)} className={`motion-number inline-block tabular-nums ${className}`} {...props}>
      {format(reduced ? (direction === 'down' ? startValue : value) : (direction === 'down' ? value : startValue))}
    </span>
  );
}
