const OrderDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-32 bg-[#2a2a2a] rounded animate-pulse mb-6" />
        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10 space-y-6">
          <div className="h-6 w-48 bg-[#2a2a2a] rounded animate-pulse" />
          <div className="h-32 bg-[#2a2a2a] rounded animate-pulse" />
          <div className="h-32 bg-[#2a2a2a] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailSkeleton;
