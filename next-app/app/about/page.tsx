import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">About Vision Valley</h1>
        <p className="text-lg text-slate-700">
          Vision Valley is a residential learning program that combines outdoor exploration,
          leadership development, and community-focused education for students.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Mission</h2>
            <p className="mt-2 text-sm text-slate-600">
              Build confidence, resilience, and collaborative leadership through immersive
              experiences.
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Approach</h2>
            <p className="mt-2 text-sm text-slate-600">
              Blend academic outcomes with practical, place-based projects and reflective practice.
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Community</h2>
            <p className="mt-2 text-sm text-slate-600">
              Foster belonging through student voice, peer mentorship, and service-oriented work.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
