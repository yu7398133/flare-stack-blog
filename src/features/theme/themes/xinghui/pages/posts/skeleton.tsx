export function PostsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tag bar skeleton */}
      <div className="xh-glass p-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 xh-skeleton rounded-xl" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="xh-glass p-5 h-[180px]">
            <div className="h-4 w-20 xh-skeleton mb-3" />
            <div className="h-6 w-full xh-skeleton mb-2" />
            <div className="h-4 w-3/4 xh-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
