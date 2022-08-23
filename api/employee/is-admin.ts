import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  const {email} = req.body;
  // TODO: remove when migrated to iO mail
  const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
  const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

  const ref = firestore.collection(Collections.ADMINS);
  const snapshot = await ref.get();
  const adminEmails = (snapshot.docs[0].data().admins || []) as string[];

  const result = adminEmails.some(mail => [fmMail, ioMail].includes(mail));
  return res.status(200).json(result);
};
