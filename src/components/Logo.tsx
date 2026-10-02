import Image from "next/image";
import Link from "next/link";

/** El logo tiene letras blancas: solo va sobre fondos oscuros (header y footer). */
export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      <Image
        src="/ED.svg"
        alt="El Desinformante"
        width={418}
        height={51}
        preload
        className="h-auto w-[196px] sm:w-[229px]"
      />
    </Link>
  );
}
