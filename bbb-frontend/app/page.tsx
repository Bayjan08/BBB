"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, User, Shield } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  const fetchProtectedData = async () => {
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Protected data from backend:", data);
        alert(`Backend response: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error("Error fetching protected data:", error);
        alert("Error connecting to backend. Make sure FastAPI server is running.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">BBB App</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">User ID:</span>
                <p className="font-mono text-xs break-all">{user.uid}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email Verified:</span>
                <p className={user.emailVerified ? "text-green-600" : "text-yellow-600"}>
                  {user.emailVerified ? "Yes" : "No"}
                </p>
              </div>
              {user.displayName && (
                <div>
                  <span className="text-sm text-gray-500">Display Name:</span>
                  <p className="font-medium">{user.displayName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Backend Connection
              </CardTitle>
              <CardDescription>Test your FastAPI backend</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Click the button below to fetch protected data from your FastAPI backend.
                Make sure your backend server is running on port 8000.
              </p>
              <Button onClick={fetchProtectedData} className="w-full">
                Fetch Protected Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Next steps for your project</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>✅ Firebase Authentication configured</li>
                <li>✅ Email/Password login</li>
                <li>✅ Google Sign-in</li>
                <li>✅ Magic Link authentication</li>
                <li>✅ Protected routes</li>
                <li>🔲 Connect to FastAPI backend</li>
                <li>🔲 Add database integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
