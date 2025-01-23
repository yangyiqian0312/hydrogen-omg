import {useState, Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Link, useNavigate} from 'react-router-dom';
import {ShoppingCart, User, Search, Menu, X} from 'lucide-react';

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
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
  const {open} = useAside();
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
  const {open} = useAside();
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
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  // TODO: Cart item quantity needs fix
  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
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
function CartToggle({cart}) {
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

export default function OldHeader({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-200 to-blue-50 text-center py-4 text-base">
        <p className="text-gray-800">Use code OMGBEAUTY for $100+ orders</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
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
              <Link to="/" className="text-xl md:text-2xl font-bold">
                OMG BEAUTY
              </Link>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex flex-1 justify-center space-x-8 px-8">
              <Link to="/products/men" className="text-gray-800 hover:text-gray-600">
                Men
              </Link>
              <Link to="/products/women" className="text-gray-800 hover:text-gray-600">
                Women
              </Link>
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
              <button
                onClick={handleProfileClick}
                className="text-gray-800 hover:text-gray-600"
              >
                <User className="h-6 w-6 md:block" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t">
                <Link
                  to="/men"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Men
                </Link>
                <Link
                  to="/women"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Women
                </Link>
                {/* <Link
                  to="/mini"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Mini
                </Link>
                <Link
                  to="/gift-sets"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Gift Sets
                </Link>
                <Link
                  to="/under-20"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50"
                >
                  Under $20
                </Link> */}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
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
