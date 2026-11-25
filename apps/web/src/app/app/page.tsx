import { redirect } from 'next/navigation';

/** Visitors have no session yet, so the app entrance sends them to sign in. */
export default function AppEntrance() {
  redirect('/sign-in');
}
