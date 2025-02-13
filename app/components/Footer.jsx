import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <>
      <Suspense>
        <Await resolve={footerPromise}>
          {(footer) => (
            <footer className="bg-gray-900">
              {footer?.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}          
            </footer>
          )}
        </Await>
      </Suspense>
    </>
  );
}

const FooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white bg-pink-200">
      <button
        onClick={() => {
          console.log("Before:", isOpen);
          setIsOpen(prev => !prev);
          console.log("After:", isOpen);
        }}
        className="w-full py-4 px-6 flex justify-between items-center text-gray-800 hover:bg-pink-300 transition-all duration-200"
      >
        <span className="font-medium">{title}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </span>
        
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  // Group menu items by section
  const menuItems = (menu || FALLBACK_FOOTER_MENU).items;
  console.log('Menu Items:', menuItems);
  
  const sections = {
    "About": menuItems.filter(item => 
      item.title.toLowerCase().includes('about') || 
      item.title.toLowerCase().includes('terms')),
    "Help": menuItems.filter(item => 
      item.title.toLowerCase().includes('shipping') || 
      item.title.toLowerCase().includes('refund')),
    "Policies": menuItems.filter(item => 
      item.title.toLowerCase().includes('policy'))
  };

  console.log('Filtered Sections:', sections);

  const renderMenuItem = (item) => {
    if (!item.url) return null;
    const url =
      item.url.includes('myshopify.com') ||
      item.url.includes(publicStoreDomain) ||
      item.url.includes(primaryDomainUrl)
        ? new URL(item.url).pathname
        : item.url;
    const isExternal = !url.startsWith('/');

    return isExternal ? (
      <li key={item.id}>
        <a 
          href={url} 
          rel="noopener noreferrer" 
          target="_blank"
          className="text-gray-300 hover:text-white"
        >
          {item.title}
        </a>
      </li>
    ) : (
      <li key={item.id}>
        <NavLink
          end
          prefetch="intent"
          style={activeLinkStyle}
          to={url}
          className="text-gray-300 hover:text-white"
        >
          {item.title}
        </NavLink>
      </li>
    );
  };

  return (
    <nav className="w-full" role="navigation">
      {Object.entries(sections).map(([title, items]) => (
        <FooterSection key={title} title={title}>
          <ul className="space-y-3">
            {items.map(renderMenuItem)}
          </ul>
        </FooterSection>
      ))}
    </nav>
  );
}





function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
// import {Suspense} from 'react';
// import {Await, NavLink} from '@remix-run/react';

// /**
//  * @param {FooterProps}
//  */



// export function Footer({footer: footerPromise, header, publicStoreDomain}) {
//   return (
//     <Suspense>
//       <Await resolve={footerPromise}>
//         {(footer) => (
//           <footer className="footer">
//             {footer?.menu && header.shop.primaryDomain?.url && (
//               <FooterMenu
//                 menu={footer.menu}
//                 primaryDomainUrl={header.shop.primaryDomain.url}
//                 publicStoreDomain={publicStoreDomain}
//               />
//             )}
//           </footer>
//         )}
//       </Await>
//     </Suspense>
//   );
// }

// /**
//  * @param {{
//  *   menu: FooterQuery['menu'];
//  *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
//  *   publicStoreDomain: string;
//  * }}
//  */
// function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
//   return (
//     <nav className="footer-menu" role="navigation">
//       {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
//         if (!item.url) return null;
//         // if the url is internal, we strip the domain
//         const url =
//           item.url.includes('myshopify.com') ||
//           item.url.includes(publicStoreDomain) ||
//           item.url.includes(primaryDomainUrl)
//             ? new URL(item.url).pathname
//             : item.url;
//         const isExternal = !url.startsWith('/');
//         return isExternal ? (
//           <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
//             {item.title}
//           </a>
//         ) : (
//           <NavLink
//             end
//             key={item.id}
//             prefetch="intent"
//             style={activeLinkStyle}
//             to={url}
//           >
//             {item.title}
//           </NavLink>
//         );
//       })}
//     </nav>
//   );
// }

// const FALLBACK_FOOTER_MENU = {
//   id: 'gid://shopify/Menu/199655620664',
//   items: [
//     {
//       id: 'gid://shopify/MenuItem/461633060920',
//       resourceId: 'gid://shopify/ShopPolicy/23358046264',
//       tags: [],
//       title: 'Privacy Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/privacy-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633093688',
//       resourceId: 'gid://shopify/ShopPolicy/23358013496',
//       tags: [],
//       title: 'Refund Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/refund-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633126456',
//       resourceId: 'gid://shopify/ShopPolicy/23358111800',
//       tags: [],
//       title: 'Shipping Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/shipping-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633159224',
//       resourceId: 'gid://shopify/ShopPolicy/23358079032',
//       tags: [],
//       title: 'Terms of Service',
//       type: 'SHOP_POLICY',
//       url: '/policies/terms-of-service',
//       items: [],
//     },
//   ],
// };

// /**
//  * @param {{
//  *   isActive: boolean;
//  *   isPending: boolean;
//  * }}
//  */
// function activeLinkStyle({isActive, isPending}) {
//   return {
//     fontWeight: isActive ? 'bold' : undefined,
//     color: isPending ? 'grey' : 'white',
//   };
// }

// /**
//  * @typedef {Object} FooterProps
//  * @property {Promise<FooterQuery|null>} footer
//  * @property {HeaderQuery} header
//  * @property {string} publicStoreDomain
//  */

// /** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
// /** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
