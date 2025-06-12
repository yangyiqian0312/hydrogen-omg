import { useAside } from '~/components/Aside';
import { Link } from 'react-router-dom';
import { AddToCartButton } from '~/components/AddToCartButton';
export default function GalleryProductCard({ node }) {
    const { open } = useAside();
    const compareAtPrice = node.variants.edges[0]?.node.compareAtPrice? Number(node.variants.edges[0]?.node.compareAtPrice.amount).toFixed(2): null;
    const price= Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2);
    const discount = node.variants.edges[0]?.node.compareAtPrice?  ((compareAtPrice - price) / compareAtPrice) * 100 : 0;
    
    return (
        <div
            className="rounded-lg flex flex-col overflow-hidden shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
        >
            {/* Product card content remains the same */}
            <Link
                to={`/products/${node.handle}`}
                className="relative aspect-square p-1"
            >
                {node.images.edges[0] ? (
                    <img
                        src={node.images.edges[0].node.url}
                        alt={node.title}
                        className="w-full aspect-square object-contain"
                    />
                ) : (
                    <img
                        src="/api/placeholder/400/400"
                        alt="Placeholder"
                        className="w-full aspect-square object-contain"
                    />
                )}
                { discount !=0 &&<span className="ml-2 mt-2 absolute top-0 left-0 text-red-500 font-semibold bg-pink-100 px-4  rounded">{discount.toFixed(0)}% OFF</span>}
            </Link>

            <div className="p-3 flex flex-col h-full justify-between">
                <Link
                    to={`/products/${node.handle}`}
                    className="block"
                >
                    <div className="font-semibold text-black uppercase hover:underline truncate">
                        {node.vendor || 'Unknown Brand'}
                    </div>
                    <p className="text-sm font-normal mb-2 text-gray-800 overflow-hidden 
                    h-auto max-h-12
                    line-clamp-2">
                        {node.abbrTitle?.value
                            ? node.abbrTitle.value
                            : node.title.replace(new RegExp(`^${node.vendor}\\s*`), '')}
                    </p>
                </Link>

                <div className='pt-1'>
                    <p className={`font-bold ${node.variants.edges[0]?.node.compareAtPrice ? 'text-red-500' : ''}`}>
                        ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                        {node.variants.edges[0]?.node.compareAtPrice && (
                            <span className="ml-2 text-gray-500 line-through">
                                ${Number(node.variants.edges[0]?.node.compareAtPrice.amount || 0).toFixed(2)}
                            </span>
                        )}
                    </p>
                    <div className="2xl:flex 2xl:justify-end 2xl:flex-none 2xl:pr-4 py-2 2xl:py-0">
                        <AddToCartButton
                            disabled={!node.selectedOrFirstAvailableVariant.availableForSale}
                            onClick={() => {
                                open('cart');
                            }}
                            lines={[
                                {
                                    merchandiseId: node.selectedOrFirstAvailableVariant.id,
                                    quantity: 1,
                                    selectedVariant: node.selectedOrFirstAvailableVariant,
                                },
                            ]}
                        >
                            {node.selectedOrFirstAvailableVariant.availableForSale ? 'Add to cart' : 'Sold out'}
                        </AddToCartButton>
                    </div>
                </div>
            </div>
        </div>
    );
}