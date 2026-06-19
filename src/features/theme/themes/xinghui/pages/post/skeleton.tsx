export function PostPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 w-24 xh-skeleton" />
      <div className="xh-glass px-6 md:px-10 pt-8 pb-6">
        <div className="h-10 w-3/4 xh-skeleton mb-4" />
        <div className="flex gap-4 mb-6">
          <div className="h-4 w-32 xh-skeleton" />
          <div className="h-4 w-24 xh-skeleton" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-4 w-full xh-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}
