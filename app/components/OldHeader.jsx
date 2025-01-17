import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';

export default function OldHeader() {
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
      <div className="bg-pink-100 text-center py-2 px-4 text-sm">
        <p className="text-gray-800">Use code SCENTLOVE for $100+ orders</p>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white">
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
              <Link to="/men" className="text-gray-800 hover:text-gray-600">
                Men
              </Link>
              <Link to="/women" className="text-gray-800 hover:text-gray-600">
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
              <button 
                onClick={handleCartClick}
                className="text-gray-800 hover:text-gray-600 relative"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>
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