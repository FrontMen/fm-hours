import * as fs from 'fs';
import generateServiceAccountFile from '.';

const mockHook = jest.fn((_, cb) => cb());

jest.mock('fs');

const buildDir = '/test/build/dir';

describe('fn: generateServiceAccountFile', () => {
  it('Throws error if SERVICE_ACCOUNT_STRING is not defined via environment variable', () => {
    expect(() => {
      generateServiceAccountFile.call(
        {
          nuxt: {
            hook: mockHook,
          },
          options: {
            buildDir,
          },
        } as any,
        {fileName: 'myFile'}
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "generateServiceAccountFile module: No service account key provided.
      Please ensure you have defined the \\"SERVICE_ACCOUNT_STRING\\" environment variable"
    `);
  });

  it('Throws an error if SERVICE_ACCOUNT_STRING is not JSON-like', () => {
    expect(() => {
      const SERVICE_ACCOUNT_STRING = 'test-service-account-string';
      process.env.SERVICE_ACCOUNT_STRING = SERVICE_ACCOUNT_STRING;
      generateServiceAccountFile.call(
        {
          nuxt: {
            hook: mockHook,
          },
          options: {
            buildDir,
          },
        } as any,
        {fileName: 'myFile'}
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `"Error parsing service account string: SyntaxError: Unexpected token e in JSON at position 1"`
    );
  });

  it('writes the file in the received build dir with the service account content', () => {
    const SERVICE_ACCOUNT_STRING = '{"foo": true, "bar": true}';
    process.env.SERVICE_ACCOUNT_STRING = SERVICE_ACCOUNT_STRING;

    generateServiceAccountFile.call(
      {
        nuxt: {
          hook: mockHook,
        },
        options: {
          buildDir,
        },
      } as any,
      {fileName: 'myFile'}
    );

    const [firstCall] = (fs.writeFileSync as jest.Mock).mock.calls;

    const [firstArgument, secondArgument] = firstCall;
    expect(firstArgument).toEqual(`${buildDir}/myFile`);

    /**
     * Since we write the file parsed, some indentation is added and here I
     * simple remove it
     */
    const regexWhitespace = /\s/g;
    expect(secondArgument.replace(regexWhitespace, '')).toEqual(
      SERVICE_ACCOUNT_STRING.replace(regexWhitespace, '')
    );
  });
});
