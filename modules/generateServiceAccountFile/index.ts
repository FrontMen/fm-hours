import * as fs from 'fs';
import {Module} from '@nuxt/types';
import {config} from 'dotenv';

/**
 * This is necessary because at this point, we don't have access to
 * the .env environment variables
 */
config();

interface IGenerateServiceAccountFileOptions {
  fileName: string;
}

const generateServiceAccountFile: Module<IGenerateServiceAccountFileOptions> =
  function generateServiceAccountFile({fileName}) {
    /**
     * TODO: find a better hook to hookup the generation
     *
     * This is because in Dev mode, this function is gonna be called whenever
     * we change something in the project.
     */
    this.nuxt.hook('build:compile', () =>
      generateFile(fileName, this.options.buildDir)
    );
  };

function generateFile(fileName: string, buildDir: string) {
  const serviceAccountString = process.env.SERVICE_ACCOUNT_STRING;

  if (!serviceAccountString || !serviceAccountString.trim()) {
    throw new Error(
      'generateServiceAccountFile module: No service account key provided.\nPlease ensure you have defined the "SERVICE_ACCOUNT_STRING" environment variable'
    );
  }

  const parsedValue = stringToObject(serviceAccountString);
  const fileFullPath = `${buildDir}/${fileName}`;

  writeFile(parsedValue, fileFullPath);

  // eslint-disable-next-line no-console
  console.log('Service Account file generated successfully');
}

function stringToObject(str: string): any {
  try {
    return JSON.parse(str);
  } catch (error) {
    throw new Error(`Error parsing service account string: ${error}`);
  }
}

function writeFile(content: any, dest: string) {
  fs.writeFileSync(dest, JSON.stringify(content, null, 2));
}

export default generateServiceAccountFile;
