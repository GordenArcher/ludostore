import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Award,
  Gamepad2,
  Dice6,
  Sparkles,
  Crown,
  ChevronRight,
  ShoppingBag,
  Star,
  Users,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useProductStore } from "../store/productStore";
import { ProductCard } from "../components/productCard";
import { ProductCardSkeleton } from "../components/loading/productCardSkeleton";
import HeroVid from "../assets/video/hero.MOV";
import { Spinner } from "../components/loading/Spinner";

const heroVideos = [
  {
    src: HeroVid,
    poster:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=600&fit=crop",
  },
  {
    src: "https://assets.mixkit.co/videos/preview/mixkit-colorful-dice-on-a-board-32864-large.mp4",
    poster:
      "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&h=600&fit=crop",
  },
  {
    src: "https://assets.mixkit.co/videos/preview/mixkit-rolling-dice-on-a-board-32861-large.mp4",
    poster:
      "https://images.unsplash.com/photo-1586165367505-132fcd5cb4d4?w=800&h=600&fit=crop",
  },
];

const Home = () => {
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [currentVideoIndex]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const newProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Customers" },
    { icon: Star, value: "4.9", label: "Customer Rating" },
    { icon: Zap, value: "24/7", label: "Support" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% authentic products with warranty",
    },
    {
      icon: Award,
      title: "Best Price Promise",
      description: "We match any competitor's price",
    },
    {
      icon: TrendingUp,
      title: "Premium Selection",
      description: "Handpicked from top brands",
    },
  ];

  const categoryIcons: Record<string, any> = {
    ludo: Gamepad2,
    dice: Dice6,
    accessories: Sparkles,
    premium: Crown,
  };

  const getCategoryIcon = (categoryName: string) => {
    const Icon = categoryIcons[categoryName.toLowerCase()];
    return Icon || Gamepad2;
  };

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

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex(
      (prev) => (prev - 1 + heroVideos.length) % heroVideos.length,
    );
  };

  if (isLoadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" color="yellow" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <section ref={heroRef} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 1, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm mb-6">
              <Gamepad2 className="w-4 h-4" />
              Since 2024
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              The Ultimate Ludo
              <span className="text-yellow-500 block mt-2">
                Gaming Experience
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Discover premium Ludo boards, dice sets, and accessories. Elevate
              your game nights with our handpicked collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?category=premium"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-yellow-500 hover:text-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-all cursor-pointer"
              >
                <Crown className="w-5 h-5" />
                View Premium Collection
              </Link>
            </div>
          </motion.div>

          <div className="mt-16 max-w-7xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
              <video
                ref={videoRef}
                key={currentVideoIndex}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-video object-cover"
                poster={heroVideos[currentVideoIndex].poster}
              >
                <source
                  src={heroVideos[currentVideoIndex].src}
                  type="video/mp4"
                />
              </video>

              {heroVideos.length > 1 && (
                <>
                  <button
                    onClick={prevVideo}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextVideo}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-white" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-3 flex gap-2">
                <button
                  onClick={togglePlay}
                  className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-white" />
                  ) : (
                    <Play className="w-3 h-3 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3 text-white" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-white" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroVideos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`h-1 rounded-full transition-all ${
                      currentVideoIndex === index
                        ? "bg-yellow-500 w-6"
                        : "bg-white/50 hover:bg-white/80 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#1a1a1a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-400">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {isLoadingCategories
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#1e1e1e] rounded-xl p-6 text-center border border-white/10"
                  >
                    <div className="w-14 h-14 mx-auto bg-yellow-500/10 rounded-xl mb-4 animate-pulse" />
                    <div className="h-5 w-24 mx-auto bg-[#2a2a2a] rounded animate-pulse mb-2" />
                    <div className="h-4 w-16 mx-auto bg-[#2a2a2a] rounded animate-pulse" />
                  </div>
                ))
              : categories.slice(0, 4).map((category, index) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={`/products?category=${category.slug}`}
                        className="block group"
                      >
                        <div className="bg-[#1e1e1e] rounded-xl p-6 text-center border border-white/10 hover:border-yellow-500 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
                          <div className="w-14 h-14 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-7 h-7 text-yellow-500" />
                          </div>
                          <h3 className="text-white font-semibold mb-1">
                            {category.name}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {
                              products.filter((p) => p.category === category.id)
                                .length
                            }{" "}
                            products
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Featured Products
              </h2>
              <p className="text-gray-400">Hand-picked premium Ludo items</p>
            </div>
            <Link
              to="/products"
              className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 transition-colors group cursor-pointer"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingProducts
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1e1e1e] rounded-xl p-6 text-center border border-white/10 hover:border-yellow-500 transition-all hover:-translate-y-1 duration-300"
              >
                <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-400">Fresh additions to our collection</p>
            </div>
            <Link
              to="/products"
              className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 transition-colors group cursor-pointer"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 p-8 md:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=1920&h=400&fit=crop')] opacity-5 bg-cover bg-center" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-6">
                <Gamepad2 className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Level Up Your Game Night?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have transformed their
                game nights with our premium Ludo products.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors group cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
