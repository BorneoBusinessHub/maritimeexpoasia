import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 pb-24">
      <h1 className="font-display text-3xl font-semibold text-deep">Admin sign in</h1>
      <p className="mt-2 text-ink/70">Enter your email and we will send you a sign-in link.</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
