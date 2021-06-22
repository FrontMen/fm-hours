/* eslint-disable camelcase */
type JWTResponse = {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    sign_in_attributes: {
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/privatepersonalidentifier": string;
    };
  };
};

type GetTokenResponse = {
  user_name: string;
  full_name: string;
  email: string;
  groups: string[];
  cookie_domain: string;
  cookie_value: string;
  cookie_expiration: number;
};
