export function HomePageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile card skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xh-glass p-6 sm:p-8 h-[240px]">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-2xl xh-skeleton" />
            <div className="flex-1">
              <div className="h-8 w-40 xh-skeleton mb-3" />
              <div className="h-4 w-64 xh-skeleton mb-2" />
              <div className="h-4 w-48 xh-skeleton" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 xh-glass p-5 h-[240px]">
          <div className="h-4 w-24 xh-skeleton mb-4" />
          <div className="h-6 w-full xh-skeleton mb-2" />
          <div className="h-4 w-3/4 xh-skeleton mb-2" />
          <div className="h-4 w-1/2 xh-skeleton" />
        </div>
      </div>

      {/* Posts grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="xh-glass p-5 h-[180px]">
            <div className="h-4 w-20 xh-skeleton mb-3" />
            <div className="h-6 w-full xh-skeleton mb-2" />
            <div className="h-4 w-3/4 xh-skeleton mb-2" />
            <div className="h-4 w-1/2 xh-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
