import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { NuxtFireInstance } from "@nuxtjs/firebase";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

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
/* eslint-disable */

export default class ApiService {
  fire: NuxtFireInstance;
  axios: NuxtAxiosInstance;
  ApiUrl = "/api/v1";

  constructor(fire: NuxtFireInstance, axios: NuxtAxiosInstance) {
    this.fire = fire;
    this.axios = axios;
  }

  setCookie(cookieData: string, expires: number): void {
    Cookies.set("hosted-tools-api-auth-2", cookieData, {
      expires,
      path: "",
      secure: true,
    });
  }

  getAuthCookie() {
    return Cookies.get("hosted-tools-api-auth-2")
  }

  decodeAuthResponseToken(token: string): JWTResponse {
    return jwtDecode(token);
  }

  getPPidFromJWTToken(responseToken: string) {
    return this.decodeAuthResponseToken(responseToken).firebase
      .sign_in_attributes[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/privatepersonalidentifier"
    ];
  }

  getToken(ppid: string): Promise<GetTokenResponse> {
     return this.axios.$post(
      "/api/get-token/hours.frontmen.nl/bridge.hosted-tools.com/" + ppid
    );
  }

  async setSessionCookieByPpid(ppid: string): Promise<boolean> {
    const tokenResponse: GetTokenResponse = await this.getToken(ppid);
    if (tokenResponse.cookie_value) {
      this.setCookie(tokenResponse.cookie_value, tokenResponse.cookie_expiration);
      return true;
    } else {
      return false;
    }
  }

  async getUserInfo() {
    const employeeId = await this.axios.$get(`${this.ApiUrl}/users/me`, {
      withCredentials: true,
    });
    return employeeId;
  }
}
