// app/signup/page.tsx

'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react'; // Import React and useState

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth(); // Destructure signup from useAuth

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for UI feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(name, email, password); // Call integrated signup function
      router.push('/home'); // Navigate on success
    } catch (err: any) {
      // Handle API errors (e.g., 409 Conflict for existing email)
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center w-full max-w-md border border-gray-800 rounded-2xl p-10 bg-gray-900 shadow-xl">
        <h1 className="text-5xl font-extrabold mb-2 text-purple-400 text-center">Saksham</h1>
        <h2 className="text-2xl text-white mb-4 text-center">Welcome! Sign up to get started</h2>

        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg w-full text-center">{error}</div>}

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-bold text-lg mt-4 disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-400 text-center">
          Already have an account? <a href="/login" className="text-purple-400 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
}