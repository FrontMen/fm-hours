import get from 'lodash.get';

export async function extractUserFromAuthUser(authUser: any): Promise<User> {
  try {
    /**
     * Instead reaching obfuscated data, we can rely on getIdToken from
     * firebase auth.
     */
    const samlToken = (await authUser.getIdToken()) || null;

    const user: User = {
      displayName: get(authUser, 'displayName'),
      email: get(authUser, 'email'),
      emailVerified: get(authUser, 'emailVerified'),
      uid: get(authUser, 'uid'),
      photoURL: get(authUser, 'photoURL', null),
      bridgeUid: get(authUser, 'bridgeUid', null),
      samlToken,
    };

    return user;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'Something went wrong while extracting user info from AuthUser'
    );
    throw error;
  }
}
