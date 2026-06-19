export function ProjectsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-8 w-32 xh-skeleton mb-2" />
        <div className="h-4 w-48 xh-skeleton" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="xh-glass p-5 h-[200px]">
            <div className="h-6 w-full xh-skeleton mb-2" />
            <div className="h-4 w-3/4 xh-skeleton mb-2" />
            <div className="h-4 w-1/2 xh-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
