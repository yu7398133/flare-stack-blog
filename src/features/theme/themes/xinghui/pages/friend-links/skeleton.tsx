export function FriendLinksPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-8 w-32 xh-skeleton mb-2" />
        <div className="h-4 w-48 xh-skeleton" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="xh-glass p-5 h-[88px]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl xh-skeleton" />
              <div className="flex-1">
                <div className="h-5 w-24 xh-skeleton mb-2" />
                <div className="h-3 w-full xh-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
