import { useActionData, Form } from '@remix-run/react';
import { useState } from 'react';
import { Link } from '@remix-run/react';

export default function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const actionData = useActionData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 p-6 border rounded-xl shadow">
      <Form method="post" className="space-y-4">
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
        <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
          Log In
        </button>
      </Form>
      {actionData && !actionData.success && (
        <div className="text-center text-sm text-red-600">
          {actionData.error.message}
        </div>
      )}
      <Link to="/account/signup" className="appearance-none hover:bg-blue-200 text-lg block p-2 mx-auto rounded">
        Don’t have an account? <div className="inline-block font-medium underline">Sign up</div>
      </Link>
    </div>
  );
}
