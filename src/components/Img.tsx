import { useState, type ImgHTMLAttributes } from "react";

// Photo with a soft branded fallback if the image can't load.
export function Img({ className = "", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [bad, setBad] = useState(false);
  if (bad) return <div className={`bg-gradient-to-br from-accent/70 to-accent-text/80 ${className}`} role="img" aria-label={rest.alt} />;
  return <img loading="lazy" decoding="async" onError={() => setBad(true)} className={`object-cover ${className}`} {...rest} />;
}
