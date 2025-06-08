"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <main className="min-h-screen bg-amber-50 font-mono">
      <nav className="flex justify-between items-center p-2 h-18 border-b border-red-100/40">
        <Link href="/" className="text-2xl font-bold">
          PDFMind
        </Link>
        <Link href="/" className="text-gray-600 hover:text-black">
          Home
        </Link>
      </nav>

      <div className="flex flex-col items-center justify-center mt-16 text-center">
        <div className="bg-white shadow-md rounded-xl p-8 w-108 h-54 border border-red-100/40 min-h-[14rem] flex flex-col justify-between">
          {session ? (
            <>
              <p className="text-2xl text-gray-800">
                Signed in as{" "}
                <span className="font-semibold">{session.user?.name}</span>{" "}
                <br />
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
              </p>
              <button
                onClick={() => signOut()}
                className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-gray-900 rounded-md cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl mb-4">Welcome to PDFMind 👋</h1>
              <div>
                <p className="mb-4 text-gray-600">Sign in to continue</p>
                <button
                  onClick={() => signIn("google", { callbackUrl })}
                  className="bg-green-100 hover:bg-green-200 text-gray-900 font-semibold px-6 py-2 rounded-lg cursor-pointer"
                >
                  Sign in with Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
