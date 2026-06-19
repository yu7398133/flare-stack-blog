export function PhotoWallPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-8 w-32 xh-skeleton mb-2" />
        <div className="h-4 w-48 xh-skeleton" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="xh-glass overflow-hidden">
            <div className="aspect-square xh-skeleton" />
            <div className="p-3">
              <div className="h-4 w-20 xh-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
