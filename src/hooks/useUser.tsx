import { useState, useEffect } from "react";
import {poolDetails} from "../lib/poolDetails";
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { AlertFn, alerter } from "./useAlert";
import { FreezeFn, freezer } from "./useFreeze";

export default function useUser (alert: AlertFn, freeze: FreezeFn) {
  // config
  let pool = new AmazonCognitoIdentity.CognitoUserPool (poolDetails);
  const [user, setUser] = useState<AmazonCognitoIdentity.CognitoUser | null> (pool.getCurrentUser ());
  // private state
  const [accessToken, setAccessToken] = useState<string> ('');
  const [idToken, setIdToken] = useState<string> ('');
  const [refreshToken, setRefreshToken] = useState<AmazonCognitoIdentity.CognitoRefreshToken | null> (null);
  const headers = {
    get: {
      'x-amz-access-token': accessToken,
      'x-amz-id-token': idToken
    },
    post: {
      'Content-Type': 'application/json',
      'x-amz-access-token': accessToken,
      Authorization: accessToken,
      'x-amz-id-token': idToken
    }
  };
  
  // public state mgmt
  const [isAuthenticated, setIsAuthenticated] = useState<boolean> (false);
  const [isChangePassword, setChangePassword] = useState<boolean> (false);
  const [isConfirmUser, setIsConfirmUser] = useState<boolean> (false);
  const [isForgotPassword, setIsResetPassword] = useState<boolean> (false);
  const [isMfaSetup, setMfaSetup] = useState<boolean> (false);
  const [isMfaRequired, setMfaRequired] = useState<boolean> (false);
  const [mfaSecretCode, setSecretCode] = useState<string> ('');
  const [userAttributes, setUserAttributes] = useState<AmazonCognitoIdentity.CognitoUserAttribute | null> (null);
  const [role, setRole] = useState<string> ('barista');
  const [name, setName] = useState<string> ('');

  // create new user
  const register = async (email: string, password: string):Promise<boolean> => new Promise ((resolve, reject) => {
    const attributes = [
      new AmazonCognitoIdentity.CognitoUserAttribute ({
        Name: 'email',
        Value: email
      })
    ]
    let unfreeze = freeze ('Signing up...');
    pool.signUp (email, password, attributes, [], (err, result) => {
      unfreeze ();
      if (err) {
        alert ('error', 'Hmm.. we couldn\'t register you, try again soon!');
        return resolve (false);
      }
      if (result) {
        alert ('info', 'Signup successful!');
        setUser (result.user);
        setIsConfirmUser (true);
        resolve (true);
      }
    })
  })

  //
  const confirmUser = (code: string) => {
    if (!user) return;
    user.confirmRegistration (code, true, (err, result) => {
      if (err) return alert ('warning', 'Incorrect code, please try again!');
      if (result) setIsConfirmUser (false);
    })
  }

  // 
  const resendConfirmationCode = () => {
    if (!user) return;
    user.resendConfirmationCode ((err, result) => {
      if (result) {
        setIsConfirmUser (true);
        alert ('info', 'Confirmation code sent!');
      }
    });
  }

  // get role/name attribute
  const getAttributes = () => {
    user?.getUserAttributes ((err, result) => {
      if (result) {
        setRole (result.find (attr => attr.getName () === 'custom:role')?.getValue () || 'barista');
        setName (result.find (attr => attr.getName () === 'name')?.getValue () || '');
      }
    })
  }

  // private method gets access and refresh tokens - call after authenticating
  const retrieveAccessTokens = async () => {
    user?.getSession ((error: any, session: AmazonCognitoIdentity.CognitoUserSession) => {
      if (error) return;
      setAccessToken (session.getAccessToken ().getJwtToken ());
      setIdToken (session.getIdToken ().getJwtToken ());
      setRefreshToken (new AmazonCognitoIdentity.CognitoRefreshToken ({RefreshToken: session.getRefreshToken ().getToken ()}));
      setIsAuthenticated (true);
    });
  };

  // private method - refresh session should be called on init
  const refreshSession = async () => {
    if (user && refreshToken) user.refreshSession (refreshToken, err => {
      if (err) return Promise.reject (err);
      return retrieveAccessTokens ();
    })
  };

  // public method - log user in with username/password
  const login = async (Username: string, Password: string) => new Promise<void> (async (resolve, reject) => {
    let details = new AmazonCognitoIdentity.AuthenticationDetails ({Username, Password});
    if (!isAuthenticated) {
      let _user = new AmazonCognitoIdentity.CognitoUser ({Username, Pool: pool});
      setUser (_user);
      _user.authenticateUser (details, {
        onSuccess: async () => {
          setIsAuthenticated (true);
          resolve ();
        },
        onFailure: error => {
          console.log ('failure')
          alert ('error', `${error}`);
          reject (error);
        },
        newPasswordRequired: attrs => {
          delete attrs.email_verified;
          delete attrs.phone_number_verified;
          delete attrs.USERNAME;
          delete attrs.name;
          setUserAttributes (attrs);
          setChangePassword (true);
        },
        mfaSetup: () => {
          _user.associateSoftwareToken ({
            associateSecretCode: (secretCode: string) => {
              setSecretCode (secretCode);
              setMfaSetup (true);
            },
            onFailure: () => {
              alert ('error', 'Error while setting up two factor authentication')
            }
          });
        },
        totpRequired: () => {
          setMfaRequired (true);
        }
      });
    }
  });

  const verifyMfaDevice = (code: string) => {
    user?.verifySoftwareToken (code, 'two factor device', {
      onSuccess: () => {
        alert ('info', 'Two factor authentication complete :)');
        retrieveAccessTokens ()
      },
      onFailure: () => {
        alert ('error', 'Could not verify mfa device')
      }
    })
  }

  const sendMfaCode = (code: string) => {
    user?.sendMFACode (code, {
      onSuccess: () => {
        retrieveAccessTokens ()
      },
      onFailure: () => {
        alert ('error', 'Code incorrect, please try again')
      }
    },
    'SOFTWARE_TOKEN_MFA')
  }

  const completePasswordChallenge = (password:string) => {
    user?.completeNewPasswordChallenge (password, userAttributes, {
      onSuccess: () => {
        init ();
        alert ('info', 'Your password has been changed');
        setChangePassword (false);
      },
      onFailure: (e: any) => {
        alert ('error', `${e}`);
      },
      mfaSetup: () => {
        user.associateSoftwareToken ({
          associateSecretCode: (secretCode: string) => {
            setSecretCode (secretCode);
            setMfaSetup (true);
          },
          onFailure: () => {
            alert ('error', 'Error while setting up two factor authentication')
          }
        });
      },
      totpRequired: () => {
        setMfaRequired (true);
      }
    })
  };

  const forgotPassword = (Username?: string) => {
    let _user = user;
    if (!user && Username) {
      _user = new AmazonCognitoIdentity.CognitoUser ({Username, Pool: pool});
      setUser (_user);
    }
    if (!_user) return;
    _user.forgotPassword ({
      onSuccess: () => {
        setIsResetPassword (true);
        alert ('info', 'We sent a verification code to your email :)');
      },
      onFailure: () => {
        alert ('error', 'Cannot reset password at this time, please contact an administrator')
      }
    })
  }
  
  const confirmPassword = (code: string, password: string) => {
    user?.confirmPassword (code, password, {
      onSuccess: () => {
        setIsResetPassword (false);
        alert ('info', 'Successfully reset password!')
      },
      onFailure: err => {
        alert ('error', `${err}`);
      }
    })
  }

  // public sign out of account
  const signOut = async () => {
    try {
      await user?.signOut();
      window.location.reload ();
    } catch (e) {
      alert ('error', 'Could not complete sign out at this time, please contact an administrator')
    }
  }

  // private method
  async function init () {
    retrieveAccessTokens ();
    refreshSession ();
  };

  useEffect (() => {
    init ();
  }, [user]);

  useEffect (() => {
    if (isAuthenticated) {
      getAttributes ();
      init ();
    }
  }, [isAuthenticated])

  return {
    isAuthenticated,
    isConfirmUser,
    isChangePassword,
    isForgotPassword,
    isMfaSetup,
    isMfaRequired,
    mfaSecretCode,
    headers,
    role,
    name,
    register,
    confirmUser,
    resendConfirmationCode,
    verifyMfaDevice,
    sendMfaCode,
    login,
    completePasswordChallenge,
    forgotPassword,
    confirmPassword,
    signOut
  };
}

export const user = useUser (alerter.alert, freezer.freeze);
export type UserHook = typeof user;