import { createContext, useContext, useEffect, useState } from 'react';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({ children, heading, type }) {
  const { type: activeType, close } = useAside();
  const expanded = type === activeType;


  // 添加事件处理函数
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  };



  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        { signal: abortController.signal },
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      {/* <button className="text-3xl" onClick={close} /> */}
      <aside>
        <header className="flex justify-between items-center">
          <h3 className="text-center text-2xl font-serif text-gray-800 w-full">{heading}</h3>
          <button className="text-3xl" onClick={close} aria-label="Close">
            {"×"}
          </button>
        </header>
        <main>{children}</main>
      </aside>
    </div>

  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({ children }) {
  const [type, setType] = useState('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
