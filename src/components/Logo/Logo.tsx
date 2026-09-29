/**
 * Portfolio logo: the sword wordmark image (public/portfolio-logo.webp,
 * cropped and downsized from LGOGO.png).
 *
 * Scales off font-size — the image height is in `em`. Set the size at the call
 * site with a text utility, e.g. <Logo className="text-2xl" />.
 */
const Logo = ({ className = "", name = "Portfolio" }: { className?: string, name?: string }) => (
  <span className={`inline-flex items-center leading-none ${className}`}>
    <img
      src="/portfolio-logo.webp"
      alt={name}
      width={900}
      height={280}
      className="h-[1.8em] w-auto shrink-0 select-none"
      draggable={false}
    />
  </span>
);

export default Logo;
