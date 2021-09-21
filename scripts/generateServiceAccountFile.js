require('dotenv').config();
const fs = require('fs')
const path = require('path')

const FILE_NAME = 'serviceAccount.json'

module.exports = {
  generateServiceAccountFile(outdir) {
    if (!outdir) {
      throw new Error('Outdir is required')
    }

    createFolderIfDoesntExist(outdir)

    const fileContent = process.env.SERVICE_ACCOUNT_STRING

    if (!fileContent) {
      // eslint-disable-next-line no-console
      console.error('No service account key provided')
      process.exit(1)
    }

    const fileFullPath = path.join(outdir, FILE_NAME)
    console.log('fileFullPath: ', fileFullPath)

    /**
     * This process only happens to format the file :)
     */
    const parsedValue = JSON.parse(fileContent);

    fs.writeFileSync(fileFullPath, JSON.stringify(parsedValue, null, 2))

    // eslint-disable-next-line no-console
    console.log(`File ${FILE_NAME} generated successfully!`)

    return fileFullPath
  }
}

function createFolderIfDoesntExist(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }
}
