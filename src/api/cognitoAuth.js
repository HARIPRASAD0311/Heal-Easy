
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { poolData } from './cognitoConfig';

const userPool = new CognitoUserPool(poolData);

export function cognitoSignIn(email, password) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const claims = session.getIdToken().payload;
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          doctorId: claims['custom:doctorId'],
          hospitalId: claims['custom:hospitalId'],
          email: claims.email,
        });
      },
      onFailure: (err) => reject(err),
    });
  });
}

export function cognitoSignOut() {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}

export function cognitoGetStoredSession() {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session.isValid()) return resolve(null);
      const claims = session.getIdToken().payload;
      resolve({
        idToken: session.getIdToken().getJwtToken(),
        doctorId: claims['custom:doctorId'],
        hospitalId: claims['custom:hospitalId'],
        email: claims.email,
      });
    });
  });
}