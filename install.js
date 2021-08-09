const path = require('path');
const fs = require ('fs');

console.log('Starting install');

const siteAppPath = path.resolve(__dirname, '../../../current/core/server/web/site/app.js');
//const siteAppPath = 'app.js';
console.log(`Site App file path : ${siteAppPath}`);

fs.copyFile(siteAppPath, siteAppPath+'.org', (err) => {
  if (err) throw err;
  console.log('Site App file backed up');

  const GoPilotSSOEntry = `
  
    // START GoPilot-Members-SSO
    siteApp.use('/gopilot-sso/',require('../../../../../../content/adapters/sso/gopilot-members-sso.js').loginMember());
    // END GoPilot-Members-SSO
`;
  const data = fs.readFileSync(siteAppPath, 'utf-8');
  //console.log(data);
  const  newValue = data.replace(/siteApp.use\(membersService.middleware.loadMemberSession\);/g, '$&'+GoPilotSSOEntry);
  fs.writeFileSync(siteAppPath, newValue);
  console.log('Site App file updated with GoPilot Member SSO');

  console.log('End install');
});

