import { SiteHeader } from "@/components/site-header";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 md:grid-cols-2">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Contact</h1>
          <p className="text-slate-700">
            Reach out for program details, admissions information, or collaboration opportunities.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Pymble Ladies College</p>
            <p className="text-sm text-slate-600">Avon Road, Pymble NSW 2073</p>
            <p className="mt-2 text-sm text-slate-600">info@visionvalley.edu.au</p>
            <p className="text-sm text-slate-600">+61 2 1234 5678</p>
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Send a message</h2>
          <form className="mt-4 space-y-3">
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Name"
            />
            <input
              type="email"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Email"
            />
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Message"
            />
            <button
              type="button"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Submit
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
