import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { useProductStore } from "../store/productStore";
import { ProductCard } from "../components/productCard";
import { ProductCardSkeleton } from "../components/loading/productCardSkeleton";

const Home = () => {
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const newProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  const features = [
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% authentic products",
    },
    { icon: Award, title: "Best Prices", description: "Price match guarantee" },
    {
      icon: TrendingUp,
      title: "Premium Quality",
      description: "Handpicked collections",
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

  if (isLoadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm mb-6">
                <Gamepad2 className="w-4 h-4" />
                Welcome to Ludo Kingdom
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                The Ultimate Ludo
                <span className="text-yellow-500"> Gaming Experience</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                Discover premium Ludo boards, dice sets, and accessories.
                Elevate your game nights with our handpicked collection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products?category=premium"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-yellow-500 hover:text-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  <Crown className="w-5 h-5" />
                  View Premium Collection
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              {products.length > 0 && products[0]?.images?.[0] ? (
                <img
                  src={`http://localhost:8000${products[0].images[0].image}`}
                  alt="Ludo Board"
                  className="rounded-2xl shadow-2xl w-full"
                />
              ) : (
                <div className="aspect-square bg-[#1e1e1e] rounded-2xl flex items-center justify-center">
                  <Gamepad2 className="w-20 h-20 text-gray-600" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-400">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
              : categories.slice(0, 4).map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        to={`/products?category=${category.slug}`}
                        className="block"
                      >
                        <div className="bg-[#1e1e1e] rounded-xl p-6 text-center border border-white/10 hover:border-yellow-500 transition-colors cursor-pointer">
                          <div className="w-14 h-14 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
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

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-[#1e1e1e] rounded-xl p-5 text-center border border-white/10 hover:border-yellow-500 transition-colors"
              >
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Featured Products
              </h2>
              <p className="text-gray-400">Hand-picked premium Ludo items</p>
            </div>
            <Link
              to="/products"
              className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-400">Fresh additions to our collection</p>
            </div>
            <Link
              to="/products"
              className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-yellow-500/30 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-500/10 rounded-full mb-6">
              <Gamepad2 className="w-7 h-7 text-yellow-500" />
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
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
