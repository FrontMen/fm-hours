import os from 'os';
import {promises as fsp} from 'fs';
import path from 'path';
import {Firestore} from '@google-cloud/firestore';

let _firestore: any = null;
export const lazyFirestore = async () => {
  if (!_firestore) {
    if (process.env.GOOGLE_CREDENTIALS) {
      const baseDir = await fsp.mkdtemp((await fsp.realpath(os.tmpdir())) + path.sep);
      const fileName = path.join(baseDir, 'credentials.json');
      const buffer = Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64');
      await fsp.writeFile(fileName, buffer);

      process.env.GOOGLE_APPLICATION_CREDENTIALS = fileName;

      _firestore = new Firestore();
    }
  }

  return _firestore;
};
