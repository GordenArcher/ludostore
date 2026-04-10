import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImagePreviewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "r") handleRotate();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = `image-${currentIndex + 1}.${blob.type.split("/")[1] || "jpg"}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      handleReset();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleReset();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={handleClickOutside}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-7xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-gray-900/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-700 shadow-xl"
            >
              <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
                <span className="text-xs text-gray-400 min-w-11.25 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                <button
                  onClick={handleRotate}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Rotate (R)"
                >
                  <RotateCw className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Reset"
                >
                  <Maximize2 className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
              </div>

              <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                <button
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Fullscreen (F11)"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-gray-300 group-hover:text-white" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-300 group-hover:text-white" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all duration-200 cursor-pointer group"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4 text-gray-300 group-hover:text-red-400" />
                </button>
              </div>
            </motion.div>

            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-10"
              >
                <div className="bg-gray-900/80 backdrop-blur-md rounded-full px-4 py-1.5 border border-gray-700">
                  <span className="text-sm text-white">
                    {currentIndex + 1} <span className="text-gray-400">/</span>{" "}
                    {images.length}
                  </span>
                </div>
              </motion.div>
            )}

            {images.length > 1 && (
              <>
                <AnimatePresence>
                  {currentIndex > 0 && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md border border-gray-700 group z-10"
                      title="Previous (←)"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-300 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {currentIndex < images.length - 1 && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md border border-gray-700 group z-10"
                      title="Next (→)"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}

            <div
              className="flex items-center justify-center min-h-[80vh] overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor:
                  zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              <motion.img
                ref={imageRef}
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={images[currentIndex]}
                alt={`Preview ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain select-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                  willChange: "transform",
                }}
                draggable={false}
              />
            </div>

            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
              >
                <div className="flex gap-2 p-2 bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-700 max-w-[90vw] overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        handleReset();
                      }}
                      className={`relative shrink-0 transition-all duration-200 cursor-pointer rounded-lg overflow-hidden ${
                        currentIndex === idx
                          ? "ring-2 ring-yellow-500 scale-105"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-12 h-12 object-cover"
                      />
                      {currentIndex === idx && (
                        <div className="absolute inset-0 bg-yellow-500/20" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-[10px] text-gray-500">
                  ← → Navigate • +/- Zoom • R Rotate • Esc Close
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
