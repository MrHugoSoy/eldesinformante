import type { Metadata } from "next";
import { exigirEditor } from "@/lib/editor";
import { MenuEditor } from "./MenuEditor";

export const metadata: Metadata = {
  title: { default: "Panel editorial", template: "%s · Panel editorial" },
  robots: { index: false },
};

export default async function LayoutEditor({ children }: LayoutProps<"/editor">) {
  await exigirEditor();

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-4 py-6 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-20 md:h-fit">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Panel editorial
        </p>
        <MenuEditor />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
