const OrdersSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-[#2a2a2a] rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-[#2a2a2a] rounded animate-pulse" />
                  <div className="h-4 w-48 bg-[#2a2a2a] rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-[#2a2a2a] rounded animate-pulse" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="h-5 w-24 bg-[#2a2a2a] rounded animate-pulse" />
                <div className="h-8 w-24 bg-[#2a2a2a] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeleton;
