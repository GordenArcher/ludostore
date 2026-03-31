const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-[#2a2a2a] rounded animate-pulse mb-8" />
        <div className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#2a2a2a] rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-[#2a2a2a] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[#2a2a2a] rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-[#2a2a2a] rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
