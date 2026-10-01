"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const textos = ["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"];

/** Selector de 1 a 5 estrellas, accesible como grupo de radio buttons. */
export function Estrellas({
  nombre,
  valor,
  onCambio,
}: {
  nombre: string;
  valor: number;
  onCambio: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const mostrado = hover || valor;

  return (
    <div className="flex items-center gap-2">
      <div role="radiogroup" aria-label={nombre} className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} de 5`}
            onClick={() => onCambio(n)}
            onMouseEnter={() => setHover(n)}
            className="p-0.5"
          >
            <Star
              className={`size-7 transition ${
                n <= mostrado ? "fill-amber-400 text-amber-400" : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="w-20 text-xs text-slate-500">{textos[mostrado]}</span>
    </div>
  );
}
