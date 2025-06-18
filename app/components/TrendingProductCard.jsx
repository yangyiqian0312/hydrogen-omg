import { Link } from '@remix-run/react';
import React from 'react';
import { AddToCartButton } from './AddToCartButton';
import { useAside } from './Aside';
/**
 * @param {{
 *   id: string;
 *   handle: string;
 *   title: string;
 *   vendor?: string;
 *   images: {edges: Array<{node: {url: string}}>};
 *   selectedOrFirstAvailableVariant: {node: {price: {amount: string}; compareAtPrice?: {amount: string}}>};
 *   className?: string;
 * }} props
 */
export function TrendingProductCard({ id, handle, abbrTitle,title, vendor, selectedOrFirstAvailableVariant, images, className = '' }) {
    const { open } = useAside();
    const price = Number(selectedOrFirstAvailableVariant.price.amount || 0).toFixed(2);
    const compareAtPrice = Number(selectedOrFirstAvailableVariant.compareAtPrice?.amount).toFixed(2);
    const discount = selectedOrFirstAvailableVariant.compareAtPrice && ((compareAtPrice - price) / compareAtPrice) * 100;
    const imageUrl = images.edges[0]?.node.url || '/api/placeholder/400/400';
    const displayTitle = abbrTitle?.value ? abbrTitle.value : title ? title.replace(new RegExp(`^${vendor}\\s*`), '') : 'N/A';

    return (
        <div className={className}>
            <div className="w-full h-full flex justify-center flex-none aspect-square relative">
                <a href={`/products/${handle}`}>
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                </a>
                { discount && discount > 0 &&<span className="ml-2 mt-2 absolute top-0 left-0 text-red-500 font-semibold bg-pink-100 px-4  rounded">{discount.toFixed(0)}% OFF</span>}
            </div>
            <div className="w-full h-full text-left flex-grow flex flex-col gap-0 justify-between px-2 border-t border-gray-200 pt-2">
                <Link
                    to={`/products/${handle}`}
                    className="w-full font-semibold text-blue-600 hover:underline flex flex-col py-2 h-full flex-grow"
                >
                    <div className="font-bold text-xs uppercase mb-1 2xl:text-lg 2xl:font-semibold">
                        {vendor || 'Unknown Brand'}
                    </div>
                    <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            className="w-7 h-7 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                        <span >5.0</span>
                      </div>
                    <div className="text-xs font-normal mb-2 h-12 xl:h-18 2xl:text-lg md:text-base w-full text-ellipsis">
                        {displayTitle}
                    </div>
                </Link>
                <div className="flex justify-between py-2 gap-4 flex-col md:flex-row w-full">
                    <div className={`font-bold text-sm 2xl:text-lg flex-none pt-2 ${compareAtPrice ? 'text-red-600' : ''}`}>
                        ${price}
                        {compareAtPrice && (
                            <span className="text-gray-500 line-through ml-2">
                                ${Number(compareAtPrice).toFixed(2)}
                            </span>
                        )}
                    </div>
                    <div className="flex md:justify-end justify-center md:flex-none pr-4">
                        <AddToCartButton
                            disabled={!selectedOrFirstAvailableVariant.availableForSale}
                            onClick={() => {
                                open('cart');
                            }}
                            lines={[
                                {
                                    merchandiseId: selectedOrFirstAvailableVariant.id,
                                    quantity: 1,
                                    selectedVariant: selectedOrFirstAvailableVariant,
                                },
                            ]}
                        >
                            {selectedOrFirstAvailableVariant.availableForSale ? 'Add to cart' : 'Sold out'}
                        </AddToCartButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default TrendingProductCard;