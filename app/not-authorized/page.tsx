import { Suspense } from "react";
import AuthErrorContent from "@/components/AuthErrorContent"; 

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthErrorContent />
    </Suspense>
  );
}
