import { redirect } from 'next/navigation';

/**
 * Menu feature "Country Authorization Matrix (MOHRE/ICP/GDRFA/MHRSD/Qiwa/LMRA/PAM)"
 * canonicalizes to the existing, fully API-backed Authorization Matrix workspace.
 */
export default function CountryAuthorizationMatrixRedirectPage() {
  redirect('/dashboard/immigration-compliance/authorization-matrix');
}
