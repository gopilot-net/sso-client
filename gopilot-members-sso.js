const ghostServerDir=require.main.path;
const logging = require(`${ghostServerDir}/node_modules/@tryghost/logging`);
const ghostConfig = require(`${ghostServerDir}/core/shared/config`);
const url = require('url');
const MembersSSR = require(`${ghostServerDir}/node_modules/@tryghost/members-ssr`);
const settingsCache = require(`${ghostServerDir}/core/shared/settings-cache`);
const axios = require(`${ghostServerDir}/node_modules/axios`);
const urlUtils = require(`${ghostServerDir}/core/shared/url-utils`);


module.exports.loginMember = () => {
    const goPilotSSOConfig = ghostConfig.get().adapters.sso['gopilot-sso'];
    return (req,res,next)=> {
    logging.info('Starting gopilot login member middleware');
    const oauthCode = url.parse(req.url,true).query.code;
    if (oauthCode != null) {
         logging.info('Received valid code');
const ghostUrl = ghostConfig.get('url');
const redirect_uri = `${ghostUrl.replace(/\/+$/, "")}/gopilot-sso/`;
axios.post(`${goPilotSSOConfig.domain}/oauth/token`, {
  client_id: `${goPilotSSOConfig.clientId}`,
  client_secret: `${goPilotSSOConfig.clientSecret}`,
    code:oauthCode,
    grant_type:'authorization_code',
    redirect_uri: redirect_uri,
  },{
      headers: {'Accept': 'application/json'},
  })
  .then(function (tokenResponse) {
     const access_token = tokenResponse.data.access_token
    logging.info(`GoPilot SSO accessToken: ${access_token}`);
   
    axios.get(`${goPilotSSOConfig.domain}/api/userinfo`,{
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + access_token
        },
  })
  .then(function (userinfoResponse) {
         const ssr= MembersSSR({
        cookieSecure: urlUtils.isSSL(urlUtils.getSiteUrl()),
        cookieKeys: [settingsCache.get('theme_session_secret')],
        cookieName: 'ghost-members-ssr',
        cookieCacheName: 'ghost-members-ssr-cache',
         getMembersApi: () => {}
    });
    const username = userinfoResponse.data.username
    logging.info(`user email:${username}`);
         ssr._setSessionCookie(req, res, username);
         return res.redirect('/');
    
  })
  .catch(function (error) {
      console.log(error);
      logging.error('Axios userinfo call error');
        return res.redirect('/');
  });
  
  })
  .catch(function (error) {
      console.log(error);
      logging.error('Axios token call error');
     return res.redirect('/');
         });
   } else {
        res.redirect('/');
        }
    }
}
