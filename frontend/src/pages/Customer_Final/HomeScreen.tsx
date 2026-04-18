import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="lume-bg lume-text font-inter selection:bg-lume-primary-container selection:text-lume-on-primary-container min-h-screen">

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-[#3b494c]/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <nav className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f5ff] text-2xl">restaurant_menu</span>
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] font-manrope">
              LUME
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/customer" className="text-[#00e5ff] font-medium border-b-2 border-[#00e5ff] px-3 py-2 text-sm">Home</Link>
            <Link to="/customer/book" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Experience</Link>
            <Link to="/customer/menu" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Menu</Link>
            <Link to="/customer/ai" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">AI Assistant</Link>
            <Link to="/customer/cart" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Cart</Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:block text-[#bac9cc] font-medium hover:text-[#c3f5ff] transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/customer/book"
              className="bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] px-4 py-2 rounded-full font-bold text-sm active:scale-95 duration-200 transition-transform whitespace-nowrap"
            >
              Reserve Now
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-16 pb-32">

        {/* ── Hero Section ── */}
        <section className="relative min-h-[600px] sm:min-h-[795px] flex items-center justify-center px-4 sm:px-6 overflow-hidden">

          {/* Background Atmosphere */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c3f5ff]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e9c349]/5 rounded-full blur-[120px]" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuK20CThf3GJjSvl9gKlWGhAf4XzdIG973Rc6qtE3ioHckjTGITs3GkUl0bB7EJwMS2PEiyqE6asT8VXDUbDHwJLj_pwxwXdfdQ4uc4PKXuvduHoYU3uAY4S3ES8RAULMDkNsY6qcCzXYKjwf6lXgfvBNGMnNuuccLbAFRMVEp_mJfay06kEzr4Oy9Pp8JwbbsxNu1zEsq5zTJI3LXMRsyD-6Y-7An_bNWR1cd_92_CsEMaSlJwu0vEc0twUPXPSo_ZNjSFyv-W5M"
              alt="Luxury dark-themed restaurant interior"
              className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay"
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl text-center px-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full lume-glass border border-[#3b494c]/15 mb-6 sm:mb-8">
              <span className="material-symbols-outlined text-[#e9c349] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#bac9cc] uppercase">
                The Future of Gastronomy
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-manrope tracking-tighter text-[#e5e2e3] mb-4 sm:mb-6 leading-[0.9]">
              Smart Dining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] via-[#00e5ff] to-[#00daf3]">
                Powered by AI
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-[#bac9cc] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
              Experience the future of fine dining with personalized recommendations and seamless booking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/customer/book" className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] rounded-xl font-bold text-base sm:text-lg shadow-[0_10px_40px_rgba(0,229,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center">
                Book Table
              </Link>
              <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 lume-glass text-[#c3f5ff] border border-[#c3f5ff]/20 rounded-xl font-bold text-base sm:text-lg hover:bg-[#c3f5ff]/5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">qr_code_2</span>
                Scan QR
              </button>
            </div>
          </div>
        </section>

        {/* ── Intelligence Grid ── */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-16 sm:mt-24">
          <h2 className="text-2xl sm:text-3xl font-black font-manrope text-[#e5e2e3] mb-8 text-center">
            Intelligent by Design
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

            {/* Card 1 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] bg-[#1c1b1c] border border-[#3b494c]/10 hover:border-[#c3f5ff]/30 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c3f5ff]/5 rounded-full blur-3xl group-hover:bg-[#c3f5ff]/10 transition-colors" />
              <div className="mb-6 sm:mb-8 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#c3f5ff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c3f5ff] text-2xl sm:text-3xl">restaurant</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-manrope mb-3 sm:mb-4 text-[#e5e2e3]">AI-Driven Menus</h3>
              <p className="text-[#bac9cc] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Dynamic digital menus that adapt to your dietary preferences, allergies, and seasonal ingredient availability in real-time.
              </p>
              <div className="pt-4 border-t border-[#3b494c]/10">
                <span className="text-[#e9c349] text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  +42% Guest Satisfaction
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] bg-[#1c1b1c] border border-[#3b494c]/10 hover:border-[#c3f5ff]/30 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c3f5ff]/5 rounded-full blur-3xl group-hover:bg-[#c3f5ff]/10 transition-colors" />
              <div className="mb-6 sm:mb-8 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#c3f5ff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c3f5ff] text-2xl sm:text-3xl">hourglass_empty</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-manrope mb-3 sm:mb-4 text-[#e5e2e3]">Live Waitlist Tracking</h3>
              <p className="text-[#bac9cc] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Precision wait times powered by predictive modeling. Receive real-time updates and secure your spot from anywhere.
              </p>
              <div className="pt-4 border-t border-[#3b494c]/10">
                <span className="text-[#e9c349] text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  99% Arrival Accuracy
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-6 sm:p-8 rounded-[2rem] bg-[#1c1b1c] border border-[#3b494c]/10 hover:border-[#c3f5ff]/30 transition-all duration-500 overflow-hidden sm:col-span-2 md:col-span-1">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c3f5ff]/5 rounded-full blur-3xl group-hover:bg-[#c3f5ff]/10 transition-colors" />
              <div className="mb-6 sm:mb-8 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#c3f5ff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c3f5ff] text-2xl sm:text-3xl">auto_awesome</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-manrope mb-3 sm:mb-4 text-[#e5e2e3]">Personalized Dining Assistant</h3>
              <p className="text-[#bac9cc] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                An intelligent concierge that remembers your favorite vintage, steak temperature, and seating preference for every visit.
              </p>
              <div className="pt-4 border-t border-[#3b494c]/10">
                <span className="text-[#e9c349] text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                  Customized for 1,200+ Palates
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Showcase ── */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-16 sm:mt-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">

            {/* Large Feature */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group min-h-[300px] sm:min-h-[400px] md:min-h-0 md:h-[600px]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO4djtCK2F3PezpAKslZYOQk8hWXp9QHDP4tBr6iUkSvBLxPTKtauYpGDuTd3e0rCj_X4LqQTv8TAcsEfesfoiSPaHdPIjOeMteRwOfmsRGv7G2p6YQVafJLET6jpJ3dXI643AlZbB6JkIkH9oeG07u_johKgW3NRqTa6YbZVaKs9lTQ-Smqru8cXdJUVoEF8TuP2yYnMM2DSJH84agVhO-eGLZ5L4zgQQocRaIusgoB0k-NC5X_VKLtZ9xj_sUBeSdCz66bo18C8"
                alt="High-tech kitchen with chefs plating gourmet food"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                <h2 className="text-2xl sm:text-4xl font-black font-manrope text-[#e5e2e3] mb-3 sm:mb-4">
                  Precision <br /> Intelligence
                </h2>
                <p className="text-[#bac9cc] max-w-sm mb-4 sm:mb-6 text-sm sm:text-base">
                  Our neural networks analyze thousands of data points to optimize restaurant operations.
                </p>
                <button className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-white font-bold text-sm hover:bg-white/20 transition-all">
                  Explore Platform
                </button>
              </div>
            </div>

            {/* Small Feature 1 – Revenue */}
            <div className="md:col-span-2 relative rounded-[2rem] bg-[#2a2a2b] p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-bold font-manrope mb-2 text-[#c3f5ff]">Revenue Optimization</h4>
                  <p className="text-[#bac9cc] text-sm">
                    Smart pricing and demand forecasting to maximize every service.
                  </p>
                </div>
                {/* Mini bar chart */}
                <div className="w-24 h-16 sm:w-32 sm:h-20 bg-[#c3f5ff]/10 rounded-xl flex items-end justify-around p-2 sm:p-3 shrink-0">
                  <div className="w-2 h-6 sm:h-8 bg-[#c3f5ff] rounded-full" />
                  <div className="w-2 h-9 sm:h-12 bg-[#c3f5ff] rounded-full" />
                  <div className="w-2 h-12 sm:h-16 bg-[#00e5ff] rounded-full" />
                  <div className="w-2 h-7 sm:h-10 bg-[#c3f5ff] rounded-full" />
                </div>
              </div>
            </div>

            {/* Small Feature 2 – Michelin */}
            <div className="relative rounded-[2rem] bg-[#353436] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[#e9c349] text-4xl sm:text-5xl mb-3 sm:mb-4">star</span>
              <h4 className="text-base sm:text-lg font-bold font-manrope text-[#e5e2e3]">Michelin Standard</h4>
              <p className="text-xs text-[#bac9cc] mt-2 uppercase tracking-widest">Quality Assurance</p>
            </div>

            {/* Small Feature 3 – Stats */}
            <div className="relative rounded-[2rem] bg-[#af8d11] p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl font-black font-manrope text-[#241a00]">12M+</span>
                <p className="text-xs sm:text-sm text-[#241a00]/80 font-medium mt-1">Reservations Served</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-[1.5rem] bg-[#131314]/90 backdrop-blur-2xl border-t border-[#3b494c]/15 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-20 px-4 pb-[env(safe-area-inset-bottom)]">
          <a href="#" className="flex flex-col items-center justify-center text-[#00e5ff] bg-[#c3f5ff]/10 rounded-2xl px-3 py-1.5 transition-transform active:scale-90">
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[10px] font-medium tracking-wide mt-0.5">Home</span>
          </a>
          <Link to="/customer/menu" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
            <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
            <span className="text-[10px] font-medium tracking-wide mt-0.5">Menu</span>
          </Link>
          <Link to="/customer/ai" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            <span className="text-[10px] font-medium tracking-wide mt-0.5">AI</span>
          </Link>
          <Link to="/customer/cart" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            <span className="text-[10px] font-medium tracking-wide mt-0.5">Cart</span>
          </Link>
        </div>
      </nav>

      {/* ── FAB ── */}
      <button className="fixed right-5 bottom-24 md:bottom-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#c3f5ff] to-[#00e5ff] text-[#00363d] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          calendar_month
        </span>
      </button>

    </div>
  );
};