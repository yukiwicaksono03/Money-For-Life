import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-medium text-primary">
          Daftar
        </Link>
      </p>
    </div>
  );
}
