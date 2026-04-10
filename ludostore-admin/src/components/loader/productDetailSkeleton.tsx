const ProductDetailSkeleton = () => (
  <div className="space-y-6 px-4 sm:px-0">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
      <div className="flex gap-3">
        <div className="h-10 w-28 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-10 w-20 bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-black"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
            <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="h-6 w-40 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <div>
              <div className="h-4 w-16 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-12 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-20 w-full bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="h-6 w-24 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="flex justify-between">
            <div>
              <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mt-1" />
            </div>
            <div className="h-10 w-28 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
