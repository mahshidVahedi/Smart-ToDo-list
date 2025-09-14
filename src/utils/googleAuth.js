import { gapi } from 'gapi-script'

const CLIENT_ID = '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks'

let tokenClient
let accessToken = null

export async function initGoogleApi() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          clientId: CLIENT_ID,
          scope: SCOPES
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  })
}

export async function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    gapi.auth2.getAuthInstance().signIn().then(user => {
      const authResponse = user.getAuthResponse()
      accessToken = authResponse.access_token
      resolve(user)
    }).catch(reject)
  })
}

export function getAccessToken() {
  return accessToken
}

export function isSignedIn() {
  const auth = gapi.auth2.getAuthInstance()
  return auth && auth.isSignedIn.get()
}

export function signOut() {
  const auth = gapi.auth2.getAuthInstance()
  if (auth) auth.signOut()
}

