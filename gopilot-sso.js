const ghostServerDir=require.main.path
const Base = require(`${ghostServerDir}/core/server/adapters/sso/Base`);
const bodyParser = require('body-parser');
const logging = require(`${ghostServerDir}/core/shared/logging`);
const UserModel = require(`${ghostServerDir}/core/server/models/user`).User;
const config = require(`${ghostServerDir}/core/shared/config`);

module.exports = class DefaultSSOAdapter extends Base {
    constructor(config) {
       super();
      this.config=config;
    }


  async getRequestCredentials(req) {
    logging.info('GoPilot SSOAdapter/getRequestCredentials');
        return new Promise(async (resolve, reject) => {
            try{
           //  console.log(req.protocol,req.host);
             req.headers['origin'] = `${req.protocol}://${req.hostname}:${req.socket.localPort}`;
             // req.headers['origin'] = req.get('host')
 const url = require('url');
   const oauthCode = url.parse(req.url,true).query.code;
        // logging.info(`oauth code:${oauthCode}`);
        if (oauthCode != null) {
         logging.info('Received valid code');
            resolve(oauthCode);
 
        }else {
            // logging.info('code invalid');
            resolve(null);
        }
    }catch(err) {
        logging.error(err);
        reject(err);
    }
        });
    }

    async getIdentityFromCredentials(code) {
        return new Promise(async (resolve, reject) => {
        // logging.info('GoPilot SSOAdapter/getIdentityFromCredentials code:'+code);
  
  
const oauthConfig=this.config;
// console.log("Ghost SSO config");
// console.log(this.config);
const adminUrl = config.get('admin:url');
// console.log(`admin url:${adminUrl}`);
let redirect_uri='';
if (adminUrl) {
  redirect_uri = `${adminUrl.replace(/\/+$/, "")}/ghost/`;
}else {
  redirect_uri = `${config.get('url').replace(/\/+$/, "")}/ghost/`;
}
// console.log(`redirect uri:${redirect_uri}`);
const axios = require('axios');
axios.post(`${oauthConfig.domain}/oauth/token`, {
  client_id: oauthConfig.key,
  client_secret: oauthConfig.secret,
    code:code,
    grant_type:'authorization_code',
    redirect_uri,
  },{
      headers: {'Accept': 'application/json'},
  })
  .then(function (response) {
      //console.log(response.data.access_token);
    // logging.info(`GoPilot SSO accessToken: ${response.data.access_token}`);
   
    axios.get(`${oauthConfig.domain}/api/userinfo`,{
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + response.data.access_token
        },
  })
  .then(function (response) {
      // console.log(response.data);
      resolve({email:response.data.username});
  })
  .catch(function (error) {
    console.log(error);
       resolve(null);
  });
  
  })
  .catch(function (error) {
    console.log(error);
       resolve(null);
  });
});

        
 }

    async getUserForIdentity(userData) {       
      let user=null;
        return new Promise(async (resolve, reject) => {
        try{
         logging.info('GoPilot SSO Adapter/getUserForIdentity user email:');
         logging.info(userData.email);
    if (userData.email != undefined)  {
      user= await UserModel.getByEmail(userData.email.toLowerCase());
    }
       if (user !=undefined) {
       logging.info('Found user with id:'+user.id);
        resolve({id:user.id});
       }else resolve(null);
        }catch (err){
            console.log(err);
            reject(err);
        }
    });
    }
}

