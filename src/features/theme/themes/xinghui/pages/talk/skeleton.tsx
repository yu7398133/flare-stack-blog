export function TalkPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-pulse">
      {/* Header */}
      <div className="text-center">
        <div className="h-10 w-48 mx-auto bg-slate-200 dark:bg-slate-700 rounded-2xl mb-3" />
        <div className="h-4 w-64 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <div className="h-12 w-full max-w-lg bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>

      {/* Entries */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row gap-4 md:gap-6 bg-white/60 dark:bg-slate-800/50 rounded-3xl p-5 md:p-6"
        >
          <div className="md:w-64 lg:w-80 aspect-video bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
