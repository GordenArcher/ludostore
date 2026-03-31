const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-[#2a2a2a] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1e1e1e] rounded-xl p-4 border border-white/10"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-[#2a2a2a] rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-[#2a2a2a] rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-[#2a2a2a] rounded animate-pulse" />
                    <div className="h-8 w-32 bg-[#2a2a2a] rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10 h-fit">
            <div className="h-6 w-32 bg-[#2a2a2a] rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-5 w-full bg-[#2a2a2a] rounded animate-pulse" />
              <div className="h-5 w-full bg-[#2a2a2a] rounded animate-pulse" />
              <div className="h-px bg-white/10 my-2" />
              <div className="h-6 w-3/4 bg-[#2a2a2a] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
