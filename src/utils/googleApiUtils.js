export const initGoogleApi = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId: '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks'
      }).then(resolve).catch(reject)
    })
  })
}