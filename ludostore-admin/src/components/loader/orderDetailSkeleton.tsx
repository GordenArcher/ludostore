const OrderDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
      </div>

      <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-48 bg-gray-800 rounded animate-pulse" />
              <div className="flex items-center gap-3 mt-2">
                <div className="h-5 w-20 bg-gray-800 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-7 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="h-5 w-28 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-56 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-5 w-40 bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-800 rounded animate-pulse mt-1" />
                        <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mt-2" />
                      </div>
                      <div className="h-5 w-20 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailSkeleton;
