"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUi } from "@/store/ui";

interface Flight {
  id: number;
  image: string;
  from: DOMRect;
  to: DOMRect;
}

interface FlyToCartContextValue {
  fly: (originRect: DOMRect, image: string) => void;
}

const FlyToCartContext = React.createContext<FlyToCartContextValue | null>(null);

let nextId = 0;

/**
 * Mounted once near the root of the storefront. Renders a cloned product
 * thumbnail that travels from wherever "add to bag" was clicked to the
 * header's cart icon, then hands off to the badge pulse.
 */
export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flights, setFlights] = React.useState<Flight[]>([]);
  const cartIconRect = useUi((s) => s.cartIconRect);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const fly = React.useCallback(
    (originRect: DOMRect, image: string) => {
      if (reduceMotion || !cartIconRect || originRect.width === 0) return;
      const id = nextId++;
      setFlights((current) => [...current, { id, image, from: originRect, to: cartIconRect }]);
      window.setTimeout(() => {
        setFlights((current) => current.filter((f) => f.id !== id));
      }, 750);
    },
    [cartIconRect, reduceMotion],
  );

  const value = React.useMemo(() => ({ fly }), [fly]);

  return (
    <FlyToCartContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {flights.map((flight) => (
              <motion.img
                key={flight.id}
                src={flight.image}
                alt=""
                aria-hidden
                initial={{
                  position: "fixed",
                  left: flight.from.left,
                  top: flight.from.top,
                  width: flight.from.width,
                  height: flight.from.height,
                  borderRadius: 8,
                  opacity: 1,
                  zIndex: 200,
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
                animate={{
                  left: flight.to.left + flight.to.width / 2 - 10,
                  top: flight.to.top + flight.to.height / 2 - 10,
                  width: 20,
                  height: 20,
                  opacity: 0.3,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="fixed"
              />
            ))}
          </AnimatePresence>,
          document.body,
        )}
    </FlyToCartContext.Provider>
  );
}

/** No-op when rendered outside the provider or when motion is disabled. */
export function useFlyToCart(): FlyToCartContextValue {
  const ctx = React.useContext(FlyToCartContext);
  return ctx ?? { fly: () => {} };
}
