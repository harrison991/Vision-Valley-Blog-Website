import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Vision Valley
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/about" className="hover:text-slate-900">
            About
          </Link>
          <Link href="/blog" className="hover:text-slate-900">
            Blog
          </Link>
          <Link href="/gallery" className="hover:text-slate-900">
            Gallery
          </Link>
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <Link
            href="/admin/login"
            className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
