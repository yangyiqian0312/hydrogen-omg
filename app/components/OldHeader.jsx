import { useState, useEffect, Suspense, useRef } from 'react';
import { Await, NavLink, useAsyncValue } from '@remix-run/react';
import { useAnalytics, useOptimisticCart } from '@shopify/hydrogen';
import { useAside } from '~/components/Aside';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import Modal from '~/components/Modal';
/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({ isLoggedIn, cart }) {
  
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      {/* <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink> */}
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <Search className="reset" onClick={() => open('search')}>
      Search
    </Search>
  );
}

/**
 * @param {{count: number | null}}
 * 渲染购物车链接和商品数量，处理用户点击行为。
 */
function CartBadge({ count }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();
  const navigate = useNavigate();
  // TODO: Cart item quantity needs fix
  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();

        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
        navigate('/cart'); 
      }}
      className="flex items-center space-x-2 text-gray-800 hover:text-gray-600"
    >
      <ShoppingCart className="h-6 w-6" />
      <span>{count === null ? '\u00A0' : count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 * 管理购物车的异步状态并渲染正确的子组件。
 */
function CartToggle({ cart }) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 * 处理购物车数据优化并传递给 CartBadge。
 */
function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}


function NavDropdown({ title, items, path }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={path}
        className="flex items-center text-gray-800 hover:text-gray-600 font-medium no-underline transition-colors duration-200 px-3 py-2 rounded-md"
      >
        {title}
        {items.length>0 && 
          <ChevronDown
            className={`h-4 w-4 ml-1 transition-transform duration-300 ease-in-out ${isHovered ? 'rotate-180 text-blue-600' : ''
              }`}
          />
        }
      </Link>

      {/* Dropdown menu with animation */}
      {items.length>0 && <div
        className={`absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out transform origin-top ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        {/* Dropdown arrow */}
        <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100"></div>

        <div className="py-2 px-1 relative">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 no-underline font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>}
    </div>
  );
}


export default function OldHeader({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const navigate = useNavigate();
  const isLoggedInPromise = useAsyncValue();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleProfileClick = async () => {

    if (isLoggedIn) {
      navigate('/account/profile');
    } else {
      navigate('/account/signup');
    }

  };


  const [currentIndex, setCurrentIndex] = useState(0);
  

  // Brand lists
  const womenBrands = [
    { name: "All Women's Products", path: "/products/women" },
    { name: "Burberry", path: "/products/women?brand=Burberry" },
    { name: "Bvlgari", path: "/products/women?brand=Bvlgari" },
    { name: "Carolina Herrera", path: "/products/women?brand=Carolina%20Herrera" },
    { name: "Chloe", path: "/products/women?brand=Chloe" },
    { name: "Givenchy", path: "/products/women?brand=Givenchy" },
    { name: "Gucci", path: "/products/women?brand=GUCCI" },
    { name: "Lattafa", path: "/products/women?brand=Lattafa" },
    { name: "Prada", path: "/products/women?brand=Prada" },
    { name: "Tiffany", path: "/products/women?brand=Tiffany" },
    { name: "Valentino", path: "/products/women?brand=Valentino" },
    { name: "Versace", path: "/products/women?brand=Versace" },
    { name: "Viktor & Rolf", path: "/products/women?brand=Viktor%20%26%20Rolf" },
    { name: "YSL", path: "/products/women?brand=YSL" },
    // { name: "Mini Set", path: "/products/women?tag=Minis" }
  ];

  const menBrands = [
    { name: "All Men's Products", path: "/products/men" },
    { name: "Burberry", path: "/products/men?brand=Burberry" },
    { name: "Bvlgari", path: "/products/men?brand=Bvlgari" },
    { name: "Carolina Herrera", path: "/products/men?brand=Carolina%20Herrera" },
    { name: "Giorgio Armani", path: "/products/men?brand=GIORGIO%20ARMANI" },
    { name: "Givenchy", path: "/products/men?brand=Givenchy" },
    { name: "Gucci", path: "/products/men?brand=GUCCI" },
    { name: "Jean Paul Gaultier", path: "/products/men?brand=JEAN%20PAUL%20GAULTIER" },
    { name: "Lattafa", path: "/products/men?brand=Lattafa" },
    { name: "Prada", path: "/products/men?brand=Prada" },
    { name: "Tiffany", path: "/products/men?brand=Tiffany" },
    { name: "Valentino", path: "/products/men?brand=Valentino" },
    { name: "Versace", path: "/products/men?brand=Versace" },
    { name: "YSL", path: "/products/men?brand=YSL" },

  ];

  const giftSetItems = [ ];

  const newArrivalItems = [ ];

  const dealsItems = [ ];

  const promos = [
    {
      id: 1,
      message: "Free shipping over $49.99 & Free returns"
    },
    {
      id: 2,
      message: "New Here? Subscribe for 20%Off with code OMGBEAUTY20"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === promos.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500); // Change message every 2.5 seconds
   
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Modal */}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      
      {/* Announcement Bar */}
      <div className="bg-black text-center pb-4 pt-2 sm:py-2 relative overflow-hidden">
        <div className="sm:h-6 h-8"> 
          <p
            className="text-white font-bold transition-all duration-1500 ease-in-out cursor-pointer"
            onClick={() => setShowModal(true)}
            style={{
              opacity: 1,
              transform: 'translateY(0)'
            }}
          >
            {promos[currentIndex].message}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white">
        <div className="max-w-full mx-auto px-2 md:px-4 xl:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl lg:text-2xl font-bold">
                OMG BEAUTY BOX
              </Link>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex flex-1 justify-center space-x-8 px-2 xl:px-8">
              <NavDropdown
                title="WOMEN"
                items={womenBrands}
                path="/products/women"
              />
              <NavDropdown
                title="MEN"
                items={menBrands}
                path="/products/men"
              />
              <NavDropdown
                title="GIFT SETS"
                items={giftSetItems}
                path="/products/giftsets"
              />

              <NavDropdown
                title="NEW ARRIVALS"
                items={newArrivalItems}
                path="/products/newarrivals"
              />

              <NavDropdown
                title="DEALS & OFFERS"
                items={dealsItems}
                path="/products/sales"
              />
              {/* <Link to="/mini" className="text-gray-800 hover:text-gray-600">
                Mini
              </Link>
              <Link to="/gift-sets" className="text-gray-800 hover:text-gray-600">
                Gift Sets
              </Link>
              <Link to="/under-20" className="text-gray-800 hover:text-gray-600">
                Under $20
              </Link> */}
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-4">
              {/* <button className="text-gray-800 hover:text-gray-600">
                <Search className="h-6 w-6" />
              </button> */}
              {/* <button
                onClick={handleCartClick}
                className="text-gray-800 hover:text-gray-600 relative"
              >
                <ShoppingCart className="h-6 w-6" />
              </button> */}
              <SearchToggle />
              <CartToggle cart={cart} />
              <a
                onClick={handleProfileClick}
                className="text-gray-800 hover:text-gray-600"
              >
                <User className="h-6 w-6 md:block" />
              </a>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t">
                <Link
                  to="/products/men"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Men
                </Link>
                <Link
                  to="products/women"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Women
                </Link>
                <Link
                  to="products/giftsets"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Gift Sets
                </Link>
                <Link to="/products/newarrivals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                  New Arrivals
                </Link>
                <Link
                  to="/products/sales"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Deals & Offers
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
