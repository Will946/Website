// A phone: a touch screen whose short side is phone-sized. Touch laptops (big screens) and desktops
// are not phones, so everything gated on PHONE leaves the computer version exactly as it was.
export const PHONE = typeof matchMedia === 'function'
  && matchMedia('(pointer: coarse)').matches
  && Math.min(screen.width, screen.height) <= 820;
