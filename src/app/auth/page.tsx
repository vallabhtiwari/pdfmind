"use client";
import { UserLimits } from "@/lib/types";
import { fetchLimits } from "@/utils/client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

function AuthContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [limits, setLimits] = useState<UserLimits | null>(null);

  useEffect(() => {
    if (!session) return;
    const url = "/api/user/limits";
    (async () => {
      const { limits: userLimits, error } = await fetchLimits(url);
      if (userLimits) setLimits(userLimits);
      if (error) toast.error(error);
    })();
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center mt-16 text-center">
      <div className="bg-white shadow-md rounded-xl p-8 w-108 h-78 border border-red-100/40 flex flex-col justify-between">
        {session ? (
          <>
            <p className="text-2xl text-gray-800">
              Signed in as{" "}
              <span className="font-semibold">{session.user?.name}</span> <br />
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
            </p>
            {limits && (
              <div className="mt-4 text-gray-700 mx-auto space-y-2">
                <div className="flex justify-between w-64">
                  <span>📄 Daily uploads</span>
                  <span>
                    {limits.dailyCount}/{limits.dailyLimit}
                  </span>
                </div>
                <div className="flex justify-between w-64">
                  <span>📅 Monthly uploads</span>
                  <span>
                    {limits.monthlyCount}/{limits.monthlyLimit}
                  </span>
                </div>
                <div className="flex justify-between w-64">
                  <span>🧾 Total uploads</span>
                  <span>{limits.totalCount}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="px-6 py-2 bg-red-100 hover:bg-red-200 text-gray-900 rounded-md cursor-pointer"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl mb-4">Welcome to PDFMind 👋</h1>
            <div className="flex flex-col">
              <p className="mb-4 text-gray-600">Sign in to continue</p>
              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="px-6 py-2 bg-green-100 hover:bg-green-200 text-gray-900 font-semibold rounded-lg cursor-pointer"
              >
                Sign in with Google
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
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

      <Suspense
        fallback={
          <div className="flex justify-center items-center mt-16">
            Loading...
          </div>
        }
      >
        <AuthContent />
      </Suspense>
    </main>
  );
}
