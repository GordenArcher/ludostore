const WishlistSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#2a2a2a] rounded-lg animate-pulse" />
            <div className="h-8 w-48 bg-[#2a2a2a] rounded-lg animate-pulse" />
          </div>
          <div className="h-5 w-32 bg-[#2a2a2a] rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10"
            >
              <div className="h-48 bg-[#2a2a2a] animate-pulse" />

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-[#2a2a2a] rounded animate-pulse" />
                  <div className="h-4 w-12 bg-[#2a2a2a] rounded animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-[#2a2a2a] rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-[#2a2a2a] rounded animate-pulse" />
                  <div className="h-4 w-12 bg-[#2a2a2a] rounded animate-pulse" />
                </div>
                <div className="h-16 bg-[#2a2a2a] rounded-lg animate-pulse" />
                <div className="flex gap-2">
                  <div className="flex-1 h-9 bg-[#2a2a2a] rounded-lg animate-pulse" />
                  <div className="w-9 h-9 bg-[#2a2a2a] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistSkeleton;
