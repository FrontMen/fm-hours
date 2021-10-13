import {extractUserFromAuthUser} from './auth';

const mockSamlToken = 'mock-token';
const mockGetIdToken = jest.fn(() => Promise.resolve(mockSamlToken));

describe('fn: extractUserFromAuthUser', () => {
  it('extract the expect info from authUser', async () => {
    const authUser = {
      uid: 'mock-uid',
      displayName: 'Tester',
      email: 'test@test.test',
      emailVerified: true,
      phoneNumber: null,
      isAnonymous: false,
      tenantId: null,
      providerData: [
        {
          uid: 'test@test.test',
          displayName: 'Tester',
          photoURL: 'http://lorem-picsum.com/300/300',
          email: 'test@test.test',
          phoneNumber: null,
          providerId: 'saml.intracto',
        },
      ],
      apiKey: 'AIzaSyAZmTDZG57U6lfPw_B9mLqyktLd3jsciSU',
      appName: '[DEFAULT]',
      authDomain: 'fm-hours-dev.firebaseapp.com',
      stsTokenManager: {
        apiKey: 'AIzaSyAZmTDZG57U6lfPw_B9mLqyktLd3jsciSU',
        refreshToken: '',
        accessToken: '',
        expirationTime: 1632477838776,
      },
      redirectEventId: null,
      lastLoginAt: '1632472727565',
      createdAt: '1631022855926',
      multiFactor: {
        enrolledFactors: [],
      },
      getIdToken: mockGetIdToken,
    };

    const expectedObject = {
      email: 'test@test.test',
      emailVerified: true,
      samlToken: mockSamlToken,
      uid: 'mock-uid',
      displayName: 'Tester',
    };

    expect(await extractUserFromAuthUser(authUser)).toEqual(expectedObject);
  });

  it('fallback photoURL and displayName if not present', async () => {
    const authUser = {
      uid: 'mock-uid',
      displayName: null,
      email: 'test@test.test',
      emailVerified: true,
      phoneNumber: null,
      isAnonymous: false,
      tenantId: null,
      providerData: [
        {
          uid: 'test@test.test',
          displayName: null,
          photoURL: null,
          email: 'test@test.test',
          phoneNumber: null,
          providerId: 'saml.intracto',
        },
      ],
      apiKey: 'AIzaSyAZmTDZG57U6lfPw_B9mLqyktLd3jsciSU',
      appName: '[DEFAULT]',
      authDomain: 'fm-hours-dev.firebaseapp.com',
      stsTokenManager: {
        apiKey: 'AIzaSyAZmTDZG57U6lfPw_B9mLqyktLd3jsciSU',
        refreshToken: '',
        accessToken: '',
        expirationTime: 1632477838776,
      },
      redirectEventId: null,
      lastLoginAt: '1632472727565',
      createdAt: '1631022855926',
      multiFactor: {
        enrolledFactors: [],
      },
      getIdToken: mockGetIdToken,
    };

    const expectedObject = {
      email: 'test@test.test',
      emailVerified: true,
      samlToken: mockSamlToken,
      uid: 'mock-uid',
      displayName: null,
    };

    expect(await extractUserFromAuthUser(authUser)).toEqual(expectedObject);
  });
});
