export const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#2a2a2a] rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-[#2a2a2a] rounded animate-pulse mb-3" />
              <div className="h-8 w-3/4 bg-[#2a2a2a] rounded animate-pulse mb-3" />
              <div className="flex items-center gap-4">
                <div className="h-5 w-32 bg-[#2a2a2a] rounded animate-pulse" />
                <div className="h-5 w-16 bg-[#2a2a2a] rounded animate-pulse" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-baseline gap-3 mb-4">
                <div className="h-8 w-24 bg-[#2a2a2a] rounded animate-pulse" />
                <div className="h-5 w-16 bg-[#2a2a2a] rounded animate-pulse" />
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-[#2a2a2a] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[#2a2a2a] rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-[#2a2a2a] rounded animate-pulse" />
              </div>
              <div className="h-6 w-32 bg-[#2a2a2a] rounded animate-pulse mb-6" />
              <div className="flex gap-4 mb-8">
                <div className="flex-1 h-12 bg-[#2a2a2a] rounded-lg animate-pulse" />
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg animate-pulse" />
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-[#2a2a2a] rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-[#2a2a2a] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
