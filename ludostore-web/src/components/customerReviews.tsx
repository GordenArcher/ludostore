import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Review1 from "../assets/video/review1.MP4";
import Review2 from "../assets/video/review2.MP4";
import Review3 from "../assets/video/review3.MP4";
import Review4 from "../assets/video/review4.MP4";

interface Review {
  id: number;
  videoUrl: string;
  comment: string;
}

const reviews: Review[] = [
  {
    id: 1,
    videoUrl: Review1,
    comment: "Absolutely love my Ludo board! The quality is amazing.",
  },
  {
    id: 2,
    videoUrl: Review2,
    comment: "Best purchase ever! The custom image feature is fantastic.",
  },
  {
    id: 3,
    videoUrl: Review3,
    comment: "Fast delivery and premium quality. Highly recommend!",
  },
  {
    id: 4,
    videoUrl: Review4,
    comment: "Great product! Customer service was very helpful.",
  },
];

const VideoModal = ({
  review,
  onClose,
}: {
  review: Review | null;
  onClose: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!review) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-4xl w-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="relative">
          <video
            ref={videoRef}
            src={review.videoUrl}
            className="w-full aspect-video"
            autoPlay
            loop
            playsInline
          />

          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={togglePlay}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-300 text-lg italic">"{review.comment}"</p>
        </div>
      </motion.div>
    </div>
  );
};

export const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay]);

  useEffect(() => {
    // Reset video when index changes
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [currentIndex]);

  const goToPrev = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToNext = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const currentReview = reviews[currentIndex];

  return (
    <>
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Customer Reviews
            </h2>
            <p className="text-gray-400">See what our customers are saying</p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer"
                onClick={() => setSelectedReview(currentReview)}
              >
                <div className="relative rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10">
                  <div className="relative aspect-video overflow-hidden bg-[#2a2a2a]">
                    <video
                      ref={videoRef}
                      src={currentReview.videoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all">
                      <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-900" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-gray-300 text-lg italic">
                      "{currentReview.comment}"
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 p-2 bg-[#1e1e1e] border border-white/20 rounded-full hover:border-yellow-500 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 p-2 bg-[#1e1e1e] border border-white/20 rounded-full hover:border-yellow-500 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAutoplay(false);
                  setCurrentIndex(idx);
                  setTimeout(() => setAutoplay(true), 10000);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx
                    ? "bg-yellow-500 w-8"
                    : "bg-white/30 w-2 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <VideoModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </>
  );
};
