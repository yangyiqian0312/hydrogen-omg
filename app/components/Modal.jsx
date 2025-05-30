
function Modal({ onClose }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        // console.log("subscribe email", email.trim());
    }
    return (
        <div className="fixed inset-0 bg-black/50 w-screen h-screen flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col">
                {/* Close Button */}
                <button onClick={onClose} className="place-self-end cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 30 30">
                        <path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"></path>
                    </svg>
                </button>
                {/* Subscription Form */}
                <h1 className="text-2xl font-bold mb-2">OMG Beauty Box</h1>
                <h2 className="text-xl font-bold mb-8">Subscribe and Enjoy 20% Off Your First Order!</h2>
                <p className="mb-4">Subscribe to our newsletter to get the latest news and updates</p>
                <form onSubmit={handleSubmit} className="flex flex-col py-4 gap-2">
                    <input type="email" placeholder="Email" required className="border rounded p-2" />
                    <button type="submit" className="bg-black text-white p-2 rounded">Subscribe</button>
                </form>
            </div>

        </div>
    )
}
export default Modal