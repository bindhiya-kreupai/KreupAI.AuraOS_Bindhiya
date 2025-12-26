/**
 * SAML 2.0 Authentication Provider
 * Supports enterprise SSO providers (OneLogin, PingIdentity, ADFS)
 *
 * @module @aura/auth
 */

import * as saml2 from 'saml2-js';

export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
  privateKey?: string;
  signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
  digestAlgorithm?: 'sha1' | 'sha256' | 'sha512';
}

export interface SAMLUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  groups?: string[];
  attributes?: Record<string, any>;
}

export class SAMLProvider {
  private serviceProvider: saml2.ServiceProvider;
  private identityProvider: saml2.IdentityProvider;

  constructor(private config: SAMLConfig) {
    // Create Service Provider
    this.serviceProvider = new saml2.ServiceProvider({
      entity_id: config.issuer,
      assert_endpoint: config.callbackUrl,
      private_key: config.privateKey,
      certificate: config.cert,
      sign_get_request: false,
      allow_unencrypted_assertion: process.env.NODE_ENV === 'development',
    });

    // Create Identity Provider
    this.identityProvider = new saml2.IdentityProvider({
      sso_login_url: config.entryPoint,
      certificates: [config.cert],
      force_authn: false,
      sign_get_request: false,
    });
  }

  /**
   * Generate SAML login URL
   */
  async getLoginUrl(relayState?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.create_login_request_url(
        this.identityProvider,
        { relay_state: relayState },
        (err, loginUrl) => {
          if (err) {
            reject(err);
          } else {
            resolve(loginUrl);
          }
        }
      );
    });
  }

  /**
   * Generate SAML logout URL
   */
  async getLogoutUrl(nameId: string, sessionIndex: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.create_logout_request_url(
        this.identityProvider,
        { name_id: nameId, session_index: sessionIndex },
        (err, logoutUrl) => {
          if (err) {
            reject(err);
          } else {
            resolve(logoutUrl);
          }
        }
      );
    });
  }

  /**
   * Validate SAML response and extract user info
   */
  async validateResponse(samlResponse: string): Promise<SAMLUser> {
    return new Promise((resolve, reject) => {
      this.serviceProvider.post_assert(
        this.identityProvider,
        { request_body: { SAMLResponse: samlResponse } },
        (err, samlResponse) => {
          if (err) {
            reject(new Error(`SAML validation failed: ${err.message}`));
            return;
          }

          try {
            const user = this.extractUserFromResponse(samlResponse);
            resolve(user);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Extract user information from SAML assertion
   */
  private extractUserFromResponse(response: any): SAMLUser {
    const user = response.user;
    const attributes = user.attributes || {};

    return {
      id: user.name_id || attributes.uid?.[0] || attributes.id?.[0],
      email: attributes.email?.[0] || attributes.mail?.[0] || user.email,
      firstName: attributes.firstName?.[0] || attributes.givenName?.[0],
      lastName: attributes.lastName?.[0] || attributes.sn?.[0],
      name:
        attributes.displayName?.[0] ||
        attributes.name?.[0] ||
        `${attributes.firstName?.[0] || ''} ${attributes.lastName?.[0] || ''}`.trim(),
      groups: attributes.groups || attributes.memberOf || [],
      attributes,
    };
  }

  /**
   * Generate SP metadata XML
   */
  getMetadataXML(): string {
    return this.serviceProvider.create_metadata();
  }
}

/**
 * Create SAML provider from environment config
 */
export function createSAMLProvider(tenantId: string): SAMLProvider {
  // In production, this would fetch config from database per tenant
  const config: SAMLConfig = {
    entryPoint: process.env[`SAML_ENTRY_POINT_${tenantId.toUpperCase()}`] || process.env.SAML_ENTRY_POINT!,
    issuer: process.env.SAML_ISSUER || `auraos-${tenantId}`,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/saml`,
    cert: process.env.SAML_IDP_CERT || '',
    privateKey: process.env.SAML_SP_PRIVATE_KEY,
    signatureAlgorithm: 'sha256',
    digestAlgorithm: 'sha256',
  };

  return new SAMLProvider(config);
}
