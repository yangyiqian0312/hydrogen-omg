import { CartForm } from '@shopify/hydrogen';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}) {

  // 处理点击事件,阻止冒泡
  const handleClick = (e, onClick) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (onClick) {
      onClick();
    }
  };

  return (
    <CartForm route="/cart" inputs={{ lines }} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={handleClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="w-full bg-black text-white px-4 py-3 rounded-lg 
                     font-medium text-sm hover:bg-gray-800
                     active:bg-gray-900 transition-colors
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
