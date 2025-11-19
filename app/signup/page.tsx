// 'use client';
// import { useRouter } from 'next/navigation';

// export default function SignupPage() {
//   const router = useRouter();
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Normally, validate and save user.
//     router.push('/home'); // Navigate to home after signup
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
//       <div className="flex flex-col items-center w-full max-w-md border border-gray-800 rounded-2xl p-10 bg-gray-900 shadow-xl">
//         <h1 className="text-5xl font-extrabold mb-2 text-purple-400 text-center">Saksham</h1>
//         <h2 className="text-2xl text-white mb-4 text-center">Welcome! Sign up to get started</h2>
//         <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Full Name"
//             className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
//             required
//           />
//           <input
//             type="email"
//             placeholder="Email Address"
//             className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
//             required
//           />
//           <button
//             type="submit"
//             className="bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-bold text-lg mt-4"
//           >
//             Sign Up
//           </button>
//         </form>
//         <div className="mt-4 text-sm text-gray-400 text-center">
//           Already have an account? <a href="/login" className="text-purple-400 hover:underline">Login</a>
//         </div>
//       </div>
//     </div>
//   );
// }





'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(); // Sets logged-in state to true
    router.push('/home'); // Navigate to home after signup
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center w-full max-w-md border border-gray-800 rounded-2xl p-10 bg-gray-900 shadow-xl">
        <h1 className="text-5xl font-extrabold mb-2 text-purple-400 text-center">Saksham</h1>
        <h2 className="text-2xl text-white mb-4 text-center">Welcome! Sign up to get started</h2>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-bold text-lg mt-4"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-400 text-center">
          Already have an account? <a href="/login" className="text-purple-400 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
}
