import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import logo from '~/assets/logo.png';
import popup from '~/assets/popup.png';
function Modal({ onClose }) {
  const [message, setMessage] = useState(null);
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setMessage(null); // Clear old message
    fetcher.submit(formData, {
      method: 'POST',
      action: '/account/subscribe',
    });
  };

  // ✅ Handle success message + auto-close after 2s
  useEffect(() => {
    if (fetcher.data?.success) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000);
      return () => clearTimeout(timer); // Cleanup
    }
    if (fetcher.data?.error) {
      setMessage({ type: 'error', text: fetcher.data.error });
    }
  }, [fetcher.data, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 w-screen h-screen flex items-center justify-center z-50">
      <div className="relative bg-white rounded-sm shadow-xl shadow-black/80 flex flex-col max-w-2xl w-full h-auto sm:mx-0 mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30">
            <path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"></path>
          </svg>
        </button>
        <div className="flex w-full h-auto gap-2">
          <img className="sm:flex hidden w-1/2 h-full object-cover" src={popup} />
          {fetcher.data?.success ? (
            <div className="text-center p-2">
              <div className="sm:mb-4 mb-2">
                <img 
                src={logo} 
                alt="" 
                className="w-24 h-24 object-contain"/>
              </div>
              <h2 className="sm:text-2xl text-xl font-bold mb-4">Thank you for subscribing!</h2>
              <p className="text-gray-600 mb-4">Enjoy your 20% Off with code: <br /> <span className="font-bold">OMGBEAUTY20</span></p>
            </div>
          ) : (
            <div className="sm:w-1/2 w-full h-full p-4">
              <div className="sm:mb-4 mb-2 flex justify-center">
                <img 
                src={logo} 
                alt="" 
                className="w-24 h-24 object-contain"/>
              </div>
              <div className="sm:text-3xl text-xl font-semibold font-serif mb-2 text-center">Enjoy</div>
              <div className="sm:text-4xl text-2xl font-bold mb-2 oldstyle-nums font-serif text-center">20% Off</div>
              <div className="sm:text-3xl text-xl font-semibold font-serif mb-2 text-center">Your First Order!</div>
              <fetcher.Form onSubmit={handleSubmit} className="flex flex-col py-4 gap-2 items-center w-full justify-center">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="border rounded p-2 w-full "
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white p-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
                {(message?.text) && (
                  <div className="text-red-600 text-sm mt-2">
                    {message.text}
                  </div>
                )}
              </fetcher.Form>
              <div className="mb-4 sm:text-sm text-xs">
                By submitting, you agree to receive occasional marketing emails and texts from OMG Beauty Box. Consent is not a condition of purchase. 
                See our <a href="/policies/terms-of-service">Terms & Privacy Policy</a>.
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
