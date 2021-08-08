const path = require('path');
const fs = require ('fs');

console.log('Starting install');

const siteAppPath = path.resolve(__dirname, '../../../current/core/server/web/site/app.js');
//const siteAppPath = 'app.js';
console.log(`Site App file path : ${siteAppPath}`);


  /*const GoPilotSSOEntry = `
  
    // Members SSO
    siteApp.use('/gopilot-sso/',require('/opt/ghost/ghost4.7/content/adapters/sso/gopilot-members-sso.js').loginMember());
`;*/
  const data = fs.readFileSync(siteAppPath, 'utf-8');
  //console.log(data);
  //var replace = "regex\\d";
/*const re = new RegExp('// Members SSO', 'g');
const re2 = new RegExp("siteApp.use('/gopilot-sso/',require('/opt/ghost/ghost4.7/content/adapters/sso/gopilot-members-sso.js').loginMember());",'g');

  let updatedValue = data.replace(re,'');
  updatedValue = updatedValue.replace(re2,'');*/
  const  updatedValue = data.replace(/\/\/ START GoPilot-Members-SSO[\s\S]*\/\/ END GoPilot-Members-SSO/g,'');
  //const  updatedValue = data.replace(/\/\/ START GoPilot-Members-SSO [\s\S]* /gm,'');
  
  fs.writeFileSync(siteAppPath, updatedValue);
  console.log('GoPilot Member SSO has been removed from Site App file');

  console.log('End uninstall');


