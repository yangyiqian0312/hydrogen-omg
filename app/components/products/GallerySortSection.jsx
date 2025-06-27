import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from '@remix-run/react';

export default function GallerySortSection({ products, brands, setSortedProducts, ifbrand = false, location }) {
    const [searchParams] = useSearchParams();
    const urlBrand = searchParams.get('brand');

    const [sortOption, setSortOption] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(urlBrand || 'all brands');
    const [isClient, setIsClient] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        setIsClient(true);
    }, []);
    useEffect(() => {
        if (urlBrand != selectedBrand) {
            setSelectedBrand(urlBrand || "all brands");
        }
        setSortedProducts(filteredProducts);
        setSortOption('');
    }, [selectedBrand, urlBrand]);

    // useEffect(() => {
    //     setSortedProducts(filteredProducts);
    //     setSortOption('');
    //   }, [filteredProducts]);

    const filteredProducts = useMemo(() => selectedBrand && selectedBrand !== "all brands"
        ? products.filter(
            ({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase()
        )
        : products, [products, selectedBrand]);

    const handleSortChange = (sortOption) => {
        setSortOption(sortOption);
        if (sortOption === 'price-asc') {
            setSortedProducts([...filteredProducts].sort((a, b) =>
                a.node.variants.edges[0].node.price.amount - b.node.variants.edges[0].node.price.amount
            ));
        } else if (sortOption === 'price-desc') {
            setSortedProducts([...filteredProducts].sort((a, b) =>
                b.node.variants.edges[0].node.price.amount - a.node.variants.edges[0].node.price.amount
            ));
        } else if (sortOption === 'new') {
            setSortedProducts([...filteredProducts].sort((a, b) =>
                b.node.createdAt.localeCompare(a.node.createdAt)
            ));
        } else {
            setSortedProducts(filteredProducts);
        }
    };

    const handleBrandChange = (brand) => {
        // navigate to /products/women?brand={brand}
        if (brand === 'all brands') {
            setSelectedBrand("all brands");
            navigate("/products/" + location);
        } else {
            setSelectedBrand(brand);
            navigate("/products/" + location + "?brand=" + encodeURIComponent(brand));
        }
    };
    return (
        <div className="flex justify-between md:px-4 pt-2 px-2 gap-2">
            <div className="hidden sm:flex items-center gap-2">
                <div className="text-sm md:text-lg font-medium text-gray-500">Showing {filteredProducts.length} products</div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                    <div className="hidden sm:block md:text-lg font-medium text-gray-500">Sort by:</div>
                    <select
                        value={sortOption}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="border border-gray-200 md:rounded-md rounded-lg px-2 py-1 text-sm md:text-lg bg-gray-200 md:bg-white">
                        {isClient && window.innerWidth < 768 ? (
                            <option value="">Sort by: Default</option>
                        ) : (
                            <option value="">Default</option>
                        )}
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="new">Newest</option>
                    </select>
                </div>
                {ifbrand && <div className="flex items-center gap-2">
                    <div className="hidden sm:block md:text-lg font-medium text-gray-500">Select Brand:</div>
                    {brands.length > 0 &&
                        <select
                            value={selectedBrand}
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="border border-gray-200 md:rounded-md rounded-lg px-2 py-1 text-sm md:text-lg bg-gray-200 md:bg-white">
                            {brands.map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>}
                </div>}
            </div>

        </div>
    );
}