export async function extractUserFromAuthUser(authUser: any): Promise<User> {
  try {
    /**
     * Instead reaching obfuscated data, we can rely on getIdToken from
     * firebase auth.
     */
    const samlToken = (await authUser.getIdToken()) || null;

    const user: User = {
      displayName: authUser.displayName,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      uid: authUser.uid,
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
