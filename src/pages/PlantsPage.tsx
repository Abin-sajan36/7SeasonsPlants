import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Sparkles,
  Leaf,
  Sun,
  Droplets,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';

interface PlantsPageProps {
  onNavigate: (view: string, param?: string) => void;
  initialFilter?: string;
  initialFilterParam?: string;
}

export const PlantsPage: React.FC<PlantsPageProps> = ({ onNavigate, initialFilter, initialFilterParam }) => {
  const { products, categories } = useStore();

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLight, setSelectedLight] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All'); // Air Purifying, Pet Friendly, Low Maintenance
  const [priceRange, setPriceRange] = useState<number>(1500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Parse initial filter param if passed via route (e.g. "category:Indoor Plants" or "filter:bestseller" or "search:hibiscus")
  useEffect(() => {
    const filterToUse = initialFilter || initialFilterParam;
    if (filterToUse) {
      if (filterToUse.startsWith('category:')) {
        setSelectedCategory(decodeURIComponent(filterToUse.replace('category:', '')));
      } else if (filterToUse.startsWith('search:')) {
        setSearchQuery(decodeURIComponent(filterToUse.replace('search:', '')));
      } else if (filterToUse === 'filter:bestseller') {
        setSelectedSpecialty('Bestseller');
      } else if (filterToUse === 'filter:new') {
        setSelectedSpecialty('New Arrival');
      }
    }
  }, [initialFilter, initialFilterParam]);

  // Unique categories list
  const plantCategories = ['All', ...categories.filter((c) => c.type !== 'combo').map((c) => c.name)];

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedLight('All');
    setSelectedDifficulty('All');
    setSelectedSpecialty('All');
    setPriceRange(1500);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Filtered & Sorted products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchBotanical = p.botanicalName?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchTags && !matchBotanical) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Light filter
        if (selectedLight !== 'All') {
          if (!p.attributes.light.toLowerCase().includes(selectedLight.toLowerCase())) {
            return false;
          }
        }

        // Difficulty filter
        if (selectedDifficulty !== 'All' && p.attributes.difficulty !== selectedDifficulty) {
          return false;
        }

        // Specialty filter
        if (selectedSpecialty === 'Air Purifying' && !p.attributes.airPurifying) return false;
        if (selectedSpecialty === 'Pet Friendly' && !p.attributes.petFriendly) return false;
        if (selectedSpecialty === 'Bestseller' && !p.isBestseller) return false;
        if (selectedSpecialty === 'New Arrival' && !p.isNewArrival) return false;

        // Price filter
        if (p.price > priceRange) return false;

        // Stock filter
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return 0; // Default featured
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedLight,
    selectedDifficulty,
    selectedSpecialty,
    priceRange,
    inStockOnly,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedLight !== 'All' ? 1 : 0) +
    (selectedDifficulty !== 'All' ? 1 : 0) +
    (selectedSpecialty !== 'All' ? 1 : 0) +
    (priceRange < 1500 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-emerald-700 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-semibold text-emerald-950">Nursery Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
                All Plants & Botanical Collection
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Showing {filteredProducts.length} verified nursery varieties healthy and ready for dispatch
              </p>
            </div>

            {/* Quick Link to Combos */}
            <button
              onClick={() => onNavigate('combos')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer w-fit shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Looking for value bundles? Explore Plant Combos →</span>
            </button>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* DESKTOP SIDEBAR FILTERS */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-6">
              {/* Header with reset */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-950">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 1. Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 block mb-2.5">
                  Category
                </label>
                <div className="space-y-1.5">
                  {plantCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white font-bold shadow-xs'
                          : 'text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Light Requirements */}
              <div className="pt-4 border-t border-emerald-900/10">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 block mb-2.5 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sunlight / Exposure</span>
                </label>
                <div className="space-y-1.5">
                  {['All', 'Indirect', 'Low Light', 'Direct Sun', 'Bright'].map((light) => (
                    <button
                      key={light}
                      onClick={() => setSelectedLight(light)}
                      className={`w-full text-left px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedLight === light
                          ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white font-bold shadow-xs'
                          : 'text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{light === 'All' ? 'All Sunlight Types' : light}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Care Difficulty */}
              <div className="pt-4 border-t border-emerald-900/10">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 block mb-2.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Care Difficulty</span>
                </label>
                <div className="space-y-1.5">
                  {['All', 'Beginner Friendly', 'Intermediate', 'Low Maintenance'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`w-full text-left px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedDifficulty === diff
                          ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white font-bold shadow-xs'
                          : 'text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{diff === 'All' ? 'All Care Levels' : diff}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Special Features */}
              <div className="pt-4 border-t border-emerald-900/10">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 block mb-2.5">
                  Specialty
                </label>
                <div className="space-y-1.5">
                  {['All', 'Air Purifying', 'Pet Friendly', 'Bestseller', 'New Arrival'].map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`w-full text-left px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedSpecialty === spec
                          ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white font-bold shadow-xs'
                          : 'text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{spec === 'All' ? 'All Features' : spec}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Max Price Slider */}
              <div className="pt-4 border-t border-emerald-900/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-emerald-950">₹{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>₹150</span>
                  <span>₹1,500</span>
                </div>
              </div>

              {/* 6. In Stock Only toggle */}
              <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">In Stock Ready</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded"
                />
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Search, Active Pills, Sorting, Mobile Filter Button */}
            <div className="bg-white p-4 rounded-3xl border border-emerald-900/10 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search in Catalog */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plants by name, botanical name, or tags..."
                    className="w-full pl-10 pr-8 py-2.5 bg-[#F4FAF5] rounded-full text-xs text-emerald-950 border border-emerald-900/10 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-950 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-900 rounded-full text-xs font-bold border border-emerald-200"
                  >
                    <Filter className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                  </button>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#F4FAF5] text-xs font-semibold text-emerald-950 border border-emerald-900/10 rounded-full px-3 py-2 outline-hidden focus:bg-white focus:border-emerald-600"
                    >
                      <option value="featured">Featured Nursery</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">New Arrivals</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-emerald-900/10">
                  <span className="text-[11px] text-gray-500 font-medium mr-1">Active:</span>
                  {selectedCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('All')}>✕</button>
                    </span>
                  )}
                  {selectedLight !== 'All' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedLight}
                      <button onClick={() => setSelectedLight('All')}>✕</button>
                    </span>
                  )}
                  {selectedDifficulty !== 'All' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedDifficulty}
                      <button onClick={() => setSelectedDifficulty('All')}>✕</button>
                    </span>
                  )}
                  {selectedSpecialty !== 'All' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedSpecialty}
                      <button onClick={() => setSelectedSpecialty('All')}>✕</button>
                    </span>
                  )}
                  {priceRange < 1500 && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      ≤ ₹{priceRange}
                      <button onClick={() => setPriceRange(1500)}>✕</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mb-3 border border-emerald-100">
                  🌱
                </div>
                <h3 className="text-base font-bold text-emerald-950 mb-1">No plants matched your criteria</h3>
                <p className="text-xs text-gray-600 max-w-sm mb-6">
                  Try clearing some filter tags or searching for a different plant name or botanical keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER MODAL / DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end backdrop-blur-2xs">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10">
                <h3 className="text-base font-bold text-emerald-950">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-emerald-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-5">
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-2">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {plantCategories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          selectedCategory === c
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light */}
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-2">Sunlight</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Indirect', 'Low Light', 'Direct Sun', 'Bright'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSelectedLight(l)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          selectedLight === l
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Beginner Friendly', 'Intermediate', 'Low Maintenance'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          selectedDifficulty === d
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-emerald-950 mb-1">
                    <span>Max Price</span>
                    <span>₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-900/10 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 bg-emerald-50 text-emerald-900 rounded-full text-xs font-bold border border-emerald-200 hover:bg-emerald-100"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
