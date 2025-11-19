// 'use client';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Normally, validate credentials, set session, etc.
//     router.push('/home'); // Navigate to home after login
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
//       <div className="flex flex-col items-center w-full max-w-md border border-gray-800 rounded-2xl p-10 bg-gray-900 shadow-xl">
//         <h1 className="text-5xl font-extrabold mb-2 text-purple-400 text-center">Saksham</h1>
//         <h2 className="text-2xl text-white mb-4 text-center">Welcome Back</h2>
//         <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
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
//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input type="checkbox" className="mr-2" />
//               Remember me
//             </label>
//             <a href="#" className="text-purple-400 text-sm hover:underline">Forgot password?</a>
//           </div>
//           <button
//             type="submit"
//             className="bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-bold text-lg mt-4"
//           >
//             Login
//           </button>
//         </form>
//         <div className="mt-4 text-sm text-gray-400 text-center">
//           Don't have an account? <a href="/signup" className="text-purple-400 hover:underline">Sign Up</a>
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(); // Set logged in status true
    router.push("/home"); // Navigate to home page
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center w-full max-w-md border border-gray-800 rounded-2xl p-10 bg-gray-900 shadow-xl">
        <h1 className="text-5xl font-extrabold mb-2 text-purple-400 text-center">Saksham</h1>
        <h2 className="text-2xl text-white mb-4 text-center">Welcome Back</h2>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-purple-400 text-sm hover:underline">Forgot password?</a>
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-bold text-lg mt-4"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-400 text-center">
          Don't have an account? <a href="/signup" className="text-purple-400 hover:underline">Sign Up</a>
        </div>
      </div>
    </div>
  );
}

