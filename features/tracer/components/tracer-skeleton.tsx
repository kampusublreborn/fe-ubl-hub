/**
 * Kerangka pemuatan halaman tracer. Bentuknya meniru isi sebenarnya (daftar tahap, judul, kartu pertanyaan,
 * dan bilah tombol) supaya tidak ada lompatan tata letak saat data datang.
 */
export function TracerSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-8 motion-safe:animate-pulse"
    >
      <span className="sr-only">Memuat tracer study</span>

      <aside aria-hidden="true" className="min-w-0">
        <div className="flex gap-1.5 xl:hidden">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 flex-1 rounded-full bg-hub-line" />
          ))}
        </div>
        <div className="hidden gap-2 xl:grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex min-h-14 items-center gap-3 rounded-2xl border border-hub-line bg-white p-3">
              <span className="size-8 shrink-0 rounded-full bg-hub-line" />
              <span className={`h-4 rounded bg-hub-line ${["w-28", "w-32", "w-24", "w-28"][i]}`} />
            </div>
          ))}
        </div>
      </aside>

      <div aria-hidden="true" className="flex min-w-0 flex-col gap-5">
        <div className="border-b border-hub-line pb-4">
          <div className="h-4 w-28 rounded bg-hub-line" />
          <div className="mt-3 h-8 w-64 max-w-full rounded-lg bg-hub-line" />
        </div>

        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`h-5 rounded bg-hub-line ${["w-3/4", "w-2/3", "w-4/5"][i]}`} />
              <div className="hidden h-5 w-20 rounded-full bg-hub-line sm:block" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].slice(0, i === 1 ? 2 : 4).map((k) => (
                <div key={k} className="flex min-h-12 items-center gap-3 rounded-xl border border-hub-line bg-hub-canvas px-4">
                  <span className="size-5 shrink-0 rounded-full bg-hub-line" />
                  <span className={`h-3.5 rounded bg-hub-line ${["w-24", "w-32", "w-20", "w-28"][k]}`} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-2 flex gap-3 rounded-2xl border border-hub-line bg-white p-2">
          <div className="h-12 w-28 rounded-xl bg-hub-canvas" />
          <div className="h-12 flex-1 rounded-xl bg-hub-line" />
        </div>
      </div>
    </div>
  );
}
