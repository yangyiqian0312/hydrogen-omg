import React from 'react';
import {Heart} from 'lucide-react';
import {Link} from 'react-router-dom';
import {products} from '~/data/products';

const Men = () => {
  const menProducts = products.filter((product) => product.category === 'Men');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Men's Fragrances
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our refined collection of distinguished fragrances for men,
            featuring sophisticated scents from prestigious brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No fragrances found</p>
              <p className="text-gray-400 mt-2">
                Please check back later for new arrivals
              </p>
            </div>
          ) : (
            menProducts.map((product) => (
              <Link
                key={product.product_id}
                to={`/product-by-sku/${product.seller_sku}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden block"
              >
                <div className="p-4">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <img
                      src={
                        product.main_product_image || '/api/placeholder/400/400'
                      }
                      alt={product.product_name}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50"
                      aria-label="Add to wishlist"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking the heart
                        // Add wishlist functionality here
                      }}
                    >
                      <Heart className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      {product.brand}
                    </div>
                    <h2 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">
                      {product.product_name}
                    </h2>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-blue-600">
                        ${product.sale_price}
                      </span>
                      {product.retail_price > product.sale_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.retail_price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {product.stock_total > 0 ? (
                        <div className="text-sm text-emerald-600 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          In Stock
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Men;
