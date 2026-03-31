import { motion } from "framer-motion";

export const ProductCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10"
    >
      <div className="aspect-square bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a] animate-pulse" />

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-[#2a2a2a] rounded animate-pulse" />
          <div className="h-4 w-12 bg-[#2a2a2a] rounded animate-pulse" />
        </div>

        <div className="h-5 w-3/4 bg-[#2a2a2a] rounded animate-pulse" />
        <div className="h-5 w-1/2 bg-[#2a2a2a] rounded animate-pulse" />

        <div className="space-y-2">
          <div className="h-3 w-full bg-[#2a2a2a] rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-[#2a2a2a] rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-[#2a2a2a] rounded animate-pulse" />
          <div className="h-4 w-12 bg-[#2a2a2a] rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
