import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "yellow" | "white" | "gold";
  className?: string;
}

export const Spinner = ({
  size = "md",
  color = "yellow",
  className = "",
}: SpinnerProps) => {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const containerSizes = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
    xl: "gap-2.5",
  };

  const colorsMap = {
    yellow: "bg-yellow-500",
    white: "bg-white",
    gold: "bg-amber-500",
  };

  const dotColor = colorsMap[color];
  const dotSize = dotSizes[size];
  const containerGap = containerSizes[size];

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  };

  const dotVariants = {
    initial: { scale: 0.6, opacity: 0.4 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  } as const;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={`flex ${containerGap}`}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            className={`${dotSize} ${dotColor} rounded-full`}
            animate={{
              y: ["0%", "-30%", "0%"],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
