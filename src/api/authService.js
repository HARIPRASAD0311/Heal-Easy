import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { poolData } from './cognitoConfig';

const userPool = new CognitoUserPool(poolData);

export function signUp(email, password, hospitalId = '') {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: 'patient' }),
      new CognitoUserAttribute({ Name: 'custom:hospitalId', Value: hospitalId }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) return reject(err);
      resolve(result.user);
    });
  });
}

export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        const claims = session.getIdToken().payload;
        resolve({
          idToken,
          accessToken: session.getAccessToken().getJwtToken(),
          patientId: claims.sub,
          email: claims.email,
          hospitalId: claims['custom:hospitalId'] || null,
        });
      },
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut() {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}

export function getStoredSession() {
  // Restores a session on page refresh, so the patient isn't logged
  // out every time they reload the app.
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session.isValid()) return resolve(null);
      const claims = session.getIdToken().payload;
      resolve({
        idToken: session.getIdToken().getJwtToken(),
        patientId: claims.sub,
        email: claims.email,
        hospitalId: claims['custom:hospitalId'] || null,
      });
    });
  });
}