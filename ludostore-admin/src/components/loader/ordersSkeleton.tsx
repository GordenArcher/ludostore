const OrdersSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
      </div>

      <div className="bg-black rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3">
                    <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-5 w-28 bg-gray-800 rounded animate-pulse" />
                      <div className="h-3 w-36 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-8 bg-gray-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 bg-gray-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-8 w-8 bg-gray-800 rounded animate-pulse ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
          <div className="h-9 w-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-9 w-24 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeleton;
