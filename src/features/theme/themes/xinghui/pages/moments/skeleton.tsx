export function MomentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-8 w-32 xh-skeleton mb-2" />
        <div className="h-4 w-48 xh-skeleton" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="xh-glass p-5">
          <div className="h-4 w-full xh-skeleton mb-2" />
          <div className="h-4 w-3/4 xh-skeleton mb-4" />
          <div className="h-32 w-48 xh-skeleton rounded-xl" />
        </div>
      ))}
    </div>
  );
}
