import os from 'os';
import {promises as fsp} from 'fs';
import path from 'path';

import {Firestore} from '@google-cloud/firestore';

let _firestore: any = null;

const lazyFirestore = async () => {
  if (!_firestore) {
    const googleCredentials = process.env.GOOGLE_CREDENTIALS
      ? process.env.GOOGLE_CREDENTIALS.toString()
      : '';
    if (googleCredentials !== '') {
      const baseDir = await fsp.mkdtemp((await fsp.realpath(os.tmpdir())) + path.sep);
      const fileName = path.join(baseDir, 'credentials.json');
      const buffer = Buffer.from(googleCredentials, 'base64');
      await fsp.writeFile(fileName, buffer);

      process.env.GOOGLE_APPLICATION_CREDENTIALS = fileName;

      _firestore = new Firestore();
    }
  }

  return _firestore;
};

export default async (req: any, res: any) => {
  const firestore = await lazyFirestore();
  const {date, startDate, endDate, employeeId} = req;

  let query = firestore.collection('timesheets');

  if (date && !startDate && !endDate) query = query.where('date', '==', date);

  if (startDate && !date) query = query.where('date', '>=', new Date(startDate).getTime());

  if (endDate && !date) query = query.where('date', '<=', new Date(endDate).getTime());

  if (employeeId) query = query.where('employeeId', '==', employeeId);

  const snapshot = await query.get();

  const result = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<Timesheet, 'id'>),
  }));

  res.status(200).json(result);
};
