import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ActiviteitType =
  | 'kunstwerk_bekeken'
  | 'mandje_toegevoegd'
  | 'bestelling_geplaatst'
  | 'account_bezocht'
  | 'beheer_bezocht'
  | 'word_klant_bezocht'
  | 'word_klant_aanvraag';

export interface ActiviteitActor {
  id: string | null;
  email: string;
  naam: string;
}

export const ONBEKENDE_ACTOR: ActiviteitActor = { id: null, email: 'Onbekend', naam: 'Onbekend' };

export async function logActiviteit(type: ActiviteitType, actor: ActiviteitActor): Promise<void> {
  try {
    await addDoc(collection(db, 'activiteiten'), {
      type,
      actorId: actor.id,
      actorEmail: actor.email,
      actorNaam: actor.naam,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Fire-and-forget: a failed log write must never block or surface an
    // error for the underlying user action (page visit, cart add, etc.).
  }
}

export function actorFromCustomer(
  user: { uid: string; email: string | null; companyName: string | null; contactPerson: string | null } | null
): ActiviteitActor {
  if (!user) {
    return ONBEKENDE_ACTOR;
  }
  return {
    id: user.uid,
    email: user.email ?? 'Onbekend',
    naam: user.companyName ?? user.contactPerson ?? 'Onbekend',
  };
}

export function actorFromMedewerker(
  user: { uid: string; email: string | null } | null
): ActiviteitActor {
  if (!user) {
    return ONBEKENDE_ACTOR;
  }
  const email = user.email ?? 'Onbekend';
  return { id: user.uid, email, naam: email };
}
