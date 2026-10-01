import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { enlacePerfil } from "@/lib/reputacion";
import type { Usuario } from "@/lib/types";

/** Nombre de usuario que lleva a su perfil público, con insignia si es fuente verificada. */
export function NombreUsuario({
  usuario,
  className = "",
}: {
  usuario: Pick<Usuario, "id" | "usuario" | "nombre" | "fuenteVerificada">;
  className?: string;
}) {
  return (
    <Link href={enlacePerfil(usuario)} className={`hover:text-acento hover:underline ${className}`}>
      {usuario.nombre}
      {usuario.fuenteVerificada && (
        <BadgeCheck
          className="ml-1 inline size-3.5 align-[-2px] text-acento"
          aria-label="Fuente verificada"
        />
      )}
    </Link>
  );
}
