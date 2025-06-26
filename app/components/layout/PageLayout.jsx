import { Await, Link } from '@remix-run/react';
import { Suspense, useId } from 'react';
import { Aside } from '~/components/layout/Aside';
import { Footer } from '~/components/layout/Footer';
import { Header, HeaderMenu } from '~/components/layout/Header';
import { CartMain } from '~/components/cart/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/search/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/search/SearchResultsPredictive';
import OldHeader from '~/components/layout/OldHeader';
import SocialFooter from '~/components/layout/SocialFooter';
// import { NewFooter } from '~/components/NewFooter';
/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedInPromise,
  publicStoreDomain,
}) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} isLoggedInPromise={isLoggedInPromise} />
      <Suspense fallback={<OldHeader header={header} cart={cart} isLoggedIn={false} publicStoreDomain={publicStoreDomain} />}>
        <Await resolve={isLoggedInPromise}>
          {(isLoggedIn) => (
            <OldHeader header={header} cart={cart} isLoggedIn={isLoggedIn} publicStoreDomain={publicStoreDomain} />
          )}
        </Await>
      </Suspense>
      <div className="border-b border-gray-200"></div>
      <main className="pt-32">{children}</main>
      {/* <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      /> */}
      {/* <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      /> */}
      <Suspense fallback={<SocialFooter isLoggedIn={false} />}>
        <Await resolve={isLoggedInPromise}>
          {(isLoggedIn) => (
            <SocialFooter isLoggedIn={isLoggedIn} />
          )}
        </Await>
      </Suspense>
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({ cart }) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search w-full px-2 h-full flex flex-col">
        <div className="flex">
          <SearchFormPredictive>
            {({ fetchResults, goToSearch, inputRef }) => (
              <>
                <input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder="Search"
                  ref={inputRef}
                  type="search"
                  list={queriesDatalistId}
                />
                &nbsp;
                <button
                  onClick={goToSearch}
                  className="px-4 py-2 bg-pink-300 text-white rounded hover:bg-blue-600"
                >
                  Search
                </button>
              </>
            )}
          </SearchFormPredictive>
        </div>
        <SearchResultsPredictive>
          {({ items, total, term, state, closeSearch, layout }) => {
            const { products, queries } = items;

            if (state === 'loading' && term.current) {
              return (
                <div className="flex justify-center items-center p-4 text-gray-600">
                  Loading...
                </div>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div className={`p-4 ${layout === 'page' ? 'h-auto' : 'h-2/3 sm:h-full flex flex-col'}`}>
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="mt-4 block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <p className="flex items-center gap-2">
                      View all results for <q className="font-medium">{term.current}</q>
                      <span className="text-lg">&rarr;</span>
                    </p>
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({ header, publicStoreDomain, isLoggedInPromise }) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedInPromise
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
