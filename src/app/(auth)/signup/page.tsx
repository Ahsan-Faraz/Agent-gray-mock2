import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Create account · Agent Gray" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
