import {NuxtRuntimeConfig} from '@nuxt/types/config/runtime';
import {NuxtAxiosInstance} from '@nuxtjs/axios';
import {NuxtFireInstance} from '@nuxtjs/firebase';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import ApiUrl from '~/helpers/api';

export default class AuthService {
  fire: NuxtFireInstance;
  axios: NuxtAxiosInstance;
  config: NuxtRuntimeConfig;

  constructor(
    fire: NuxtFireInstance,
    axios: NuxtAxiosInstance,
    config: NuxtRuntimeConfig
  ) {
    this.fire = fire;
    this.axios = axios;
    this.config = config;
  }

  setAuthCookie(cookieData: string, expires: Date): void {
    Cookies.set('hosted-tools-api-auth-2', cookieData, {
      expires,
      path: '',
      secure: true,
    });
  }

  getAuthCookie() {
    return Cookies.get('hosted-tools-api-auth-2');
  }

  deleteAuthCookie() {
    return Cookies.remove('hosted-tools-api-auth-2');
  }

  decodeAuthResponseToken(token: string): JWTResponse {
    return jwtDecode(token);
  }

  getPPidFromJWTToken(responseToken: string) {
    const ppid =
      this.decodeAuthResponseToken(responseToken).firebase.sign_in_attributes[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/privatepersonalidentifier'
      ];

    localStorage.setItem('@fm-hours/ppid', ppid);
    return ppid;
  }

  getToken(ppid: string): Promise<GetTokenResponse> {
    return this.axios.$post(
      'https://auth.hosted-tools.com/api/get-token/hours.frontmen.nl/bridge.hosted-tools.com/' +
        ppid
    );
  }

  async setSessionCookieByPpid(ppid: string): Promise<boolean> {
    const tokenResponse: GetTokenResponse = await this.getToken(ppid);
    if (tokenResponse.cookie_value) {
      this.setAuthCookie(
        tokenResponse.cookie_value,
        new Date(tokenResponse.cookie_expiration)
      );
      return true;
    } else {
      return false;
    }
  }

  async getUserInfo() {
    const employeeId = await this.axios.$get(
      `${ApiUrl(this.config)}/users/me`,
      {
        withCredentials: true,
      }
    );
    return employeeId;
  }
}
