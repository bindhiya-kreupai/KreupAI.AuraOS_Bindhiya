declare module 'saml2-js' {
  export class ServiceProvider {
    constructor(options: any);
    create_login_request_url(idp: any, options: any, cb: (err: any, loginUrl: string, requestId: string) => void): void;
    create_logout_request_url(idp: any, options: any, cb: (err: any, logoutUrl: string) => void): void;
    post_assert(idp: any, options: any, cb: (err: any, response: any) => void): void;
    create_metadata(): string;
  }
  export class IdentityProvider {
    constructor(options: any);
  }
}