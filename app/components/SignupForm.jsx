import { useActionData, Form } from '@remix-run/react';
import { useState } from 'react';
import { Link, useNavigate } from '@remix-run/react';

export default function SignupForm() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        acceptsMarketing: true,
    });
    const actionData = useActionData();
    const navigate = useNavigate();

    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValidUSPhone = (phone) =>
        /^\(?([2-9][0-9]{2})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(phone);

    const formatUSPhoneToE164 = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        return `+1${cleaned}`;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="signup-page max-w-md mx-auto my-8 space-y-6 p-6 border rounded-xl shadow">
            <Form method="post" className="signup-form space-y-4">
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="U.S. Phone (e.g. 222-333-4444)"
                        value={form.phone}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 10); // Only digits, max 10
                            let formatted = raw;
                            if (raw.length > 3 && raw.length <= 6) {
                                formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                            } else if (raw.length > 6) {
                                formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
                            }
                            setForm((prev) => ({ ...prev, phone: formatted }));
                        }}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="checkbox"
                        id="acceptsMarketing"
                        name="acceptsMarketing"
                        checked={form.acceptsMarketing}
                        onChange={handleChange}
                    />
                    <label htmlFor="acceptsMarketing" className="mx-2">Accept marketing emails</label>
                </div>
                
                <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
                    Create Account
                </button>
            </Form>
            {actionData && !actionData.success && (
                <div className="error-message text-center text-sm text-red-600">
                    {actionData.error.message}
                </div>
            )}
            <Link
                to="/account/login"
                className="appearance-none hover:bg-blue-200 text-lg block p-2 mx-auto rounded"
            >
                Already have an account? <div className="inline-block font-medium underline">Log in</div>
            </Link>
        </div>
    );
}