import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useRestaurantContext } from '../../hooks/useRestaurantContext';
import { MenuItem } from '../../types';
import { API_BASE_URL } from '../../lib/api';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export const MenuPage = () => {
  const { restaurantId } = useRestaurantContext();
  const cart = useCartStore();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch menu from backend ──────────────────────────────────────────────
  useEffect(() => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu/${restaurantId}`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        const items = data.items ?? [];
        
        // ── Deduplicate by name ──
        const uniqueItems: MenuItem[] = [];
        const seenNames = new Set();
        items.forEach((item: MenuItem) => {
          if (!seenNames.has(item.name)) {
            seenNames.add(item.name);
            uniqueItems.push(item);
          }
        });

        setMenuItems(uniqueItems);
        const cats = ['All', ...new Set<string>(uniqueItems.map((i: MenuItem) => i.category))];
        setCategories(cats);
      } catch {
        toast.error('Failed to load menu. Showing demo data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = menuItems.filter((item) => {
    const catMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const textMatch =
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false);
    return catMatch && textMatch;
  });

  const heroItem = filteredItems()[0] ?? null;

  function filteredItems() { return filtered; }

  const cartCount = cart.getTotalItems();
  const cartTotal = cart.getTotal().toFixed(2);

  const handleAdd = (item: MenuItem) => {
    cart.addItem(item);
    toast.success(`Added ${item.name} to cart`, { duration: 1500 });
  };

  return (
    <div className="lume-bg lume-text font-inter min-h-screen selection:bg-[#00e5ff]/20 selection:text-[#c3f5ff]">

      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,218,243,0.04)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f5ff]">restaurant_menu</span>
            <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] font-manrope">
              LUME
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/customer" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Home</Link>
            <Link to="/customer/book" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Reserve</Link>
            <Link to="/customer/menu" className="text-[#00e5ff] font-medium border-b-2 border-[#00e5ff] px-3 py-2 text-sm">Menu</Link>
            <Link to="/customer/ai" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">AI Assistant</Link>
            <Link to="/customer/cart" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Cart</Link>
          </div>

          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="bg-[#1c1b1c] border border-[#3b494c]/30 rounded-full py-2 pl-4 pr-10 text-sm text-[#e5e2e3] focus:border-[#00e5ff]/50 outline-none transition-all placeholder:text-[#3b494c]/70 w-48"
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#bac9cc] text-[18px]">search</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="pt-20 pb-40 px-4 sm:px-6 max-w-7xl mx-auto">

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce [animation-delay:0.15s]" />
              <div className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Hero Card (first item) ── */}
            {heroItem && (
              <section className="mb-10 sm:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-manrope font-extrabold tracking-tight text-[#c3f5ff] mb-1">
                      Menu Intelligence
                    </h1>
                    <p className="text-[#bac9cc] font-medium text-sm sm:text-base">Tailored dining based on your profile.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#af8d11]/20 border border-[#e9c349]/20 rounded-full self-start sm:self-auto">
                    <span className="material-symbols-outlined text-[#e9c349] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="text-[#e9c349] text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">Best Match for You</span>
                  </div>
                </div>

                <div className="relative group h-[220px] sm:h-[300px] md:h-[360px] rounded-2xl overflow-hidden shadow-2xl border-l-2 border-[#e9c349]">
                  {heroItem.image_url ? (
                    <img
                      src={heroItem.image_url}
                      alt={heroItem.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1c1b1c] flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[#3b494c] text-7xl">restaurant</span>
                      <span className="text-[#3b494c] text-sm font-medium">No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full md:w-2/3">
                    <div className="flex gap-2 mb-2 sm:mb-3">
                      {heroItem.isVeg && <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-widest border border-green-500/20">Veg</span>}
                      {heroItem.tags.slice(0, 1).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-[#e9c349]/10 text-[#e9c349] text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-widest border border-[#e9c349]/20">{t}</span>
                      ))}
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-manrope font-black text-[#e5e2e3] mb-1 sm:mb-2">{heroItem.name}</h2>
                    <p className="text-[#bac9cc] text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed line-clamp-2 max-w-lg">{heroItem.description}</p>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="text-2xl sm:text-3xl font-manrope font-bold text-[#c3f5ff]">₹{heroItem.price}</span>
                      <button
                        onClick={() => handleAdd(heroItem)}
                        className="bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95"
                      >
                        Add to Order
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Category Filter ── */}
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${selectedCategory === cat
                      ? 'bg-[#00e5ff] text-[#00363d]'
                      : 'bg-[#2a2a2b] text-[#bac9cc] hover:bg-[#353436]'
                      }`}
                  >
                    {cat === 'All' && selectedCategory === cat && (
                      <span className="material-symbols-outlined text-sm">filter_list</span>
                    )}
                    {cat}
                  </button>
                ))}
              </div>

              {/* Mobile search */}
              <div className="mt-3 relative sm:hidden">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full bg-[#1c1b1c] border border-[#3b494c]/30 rounded-full py-2.5 pl-4 pr-10 text-sm text-[#e5e2e3] focus:border-[#00e5ff]/50 outline-none placeholder:text-[#3b494c]/70"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#bac9cc] text-[18px]">search</span>
              </div>
            </section>

            {/* ── Dish Grid ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-[#bac9cc]">
                <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">search_off</span>
                <p className="font-bold">No dishes found</p>
                <p className="text-sm opacity-60 mt-1">Try a different category or search term</p>
              </div>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                {filtered.slice(1).map((item) => (
                  <div key={item.id} className="bg-[#1c1b1c] rounded-2xl overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300">
                    <div className="relative h-48 sm:h-60 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#252425] flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[#3b494c] text-4xl">restaurant</span>
                          <span className="text-[#3b494c] text-xs">No image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {item.isVeg && (
                          <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Veg</span>
                        )}
                        {item.stock <= item.low_stock_threshold && item.stock > 0 && (
                          <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Low Stock</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-[#c3f5ff]/10 text-[#c3f5ff] text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-wider border border-[#c3f5ff]/20">{tag}</span>
                        ))}
                        {item.spiceLevel && item.spiceLevel !== 'none' && (
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-wider border border-orange-500/20">
                            {item.spiceLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h3 className="text-lg sm:text-xl font-manrope font-bold text-[#e5e2e3] leading-tight">{item.name}</h3>
                        <span className="text-lg sm:text-xl font-manrope font-bold text-[#c3f5ff] ml-2 shrink-0">₹{item.price}</span>
                      </div>
                      <p className="text-[#bac9cc] text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        {item.time_to_cook > 0 && (
                          <span className="text-[#849396] text-[11px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {item.time_to_cook} min
                          </span>
                        )}
                        <button
                          onClick={() => handleAdd(item)}
                          className="ml-auto py-2.5 sm:py-3 px-6 rounded-xl bg-[#353436] text-[#c3f5ff] font-bold text-sm hover:bg-[#c3f5ff] hover:text-[#00363d] transition-all active:scale-95"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      {/* ── Floating Cart Bar ── */}
      {cartCount > 0 && (
        <Link to="/customer/cart" className="fixed bottom-[88px] md:bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50">
          <div className="lume-glass bg-[#353436]/90 border border-[#3b494c]/30 rounded-2xl h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <span className="material-symbols-outlined text-[#00e5ff]">shopping_cart</span>
                <span className="absolute -top-2 -right-2 bg-[#e9c349] text-[#241a00] text-[9px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">{cartCount}</span>
              </div>
              <span className="font-bold text-[#e5e2e3] text-sm sm:text-base">View Order</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-base sm:text-lg font-manrope font-bold text-[#c3f5ff]">₹{cartTotal}</span>
              <div className="bg-[#c3f5ff] text-[#00363d] font-bold px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm">
                Checkout
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-40 bg-[#131314]/90 backdrop-blur-2xl border-t border-[#3b494c]/15 h-20 px-4 flex justify-around items-center pb-[env(safe-area-inset-bottom)]">
        <Link to="/customer" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70">
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Home</span>
        </Link>
        <a href="#" className="flex flex-col items-center justify-center text-[#00e5ff] bg-[#c3f5ff]/10 rounded-2xl px-3 py-1.5">
          <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Menu</span>
        </a>
        <Link to="/customer/ai" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70">
          <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">AI</span>
        </Link>
        <Link to="/customer/cart" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70 relative">
          <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-[#e9c349] text-[#241a00] text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">{cartCount}</span>
          )}
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Cart</span>
        </Link>
      </nav>

    </div>
  );
};