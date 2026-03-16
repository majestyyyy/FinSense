import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login by default, the auth flow will handle the redirect
  redirect('/login');
}
