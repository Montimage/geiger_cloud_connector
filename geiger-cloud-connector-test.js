const {createCompany, loadConfig, registerPlugin, sendSensorData, sendRecommendation, sendRecommendationStatus, getAllCompany, getAllSensorDatas, getAllEventByType, getAllRecommendations, getAllRecommendationStatus, getGeigerInfo, registerPluginWithCompanyId} = require('./geiger-cloud-connector');

loadConfig();

// createCompany({
//   company_name: "Company-02",
//   company_users: [],
//   founding_date: "2022-09-20T21:05:46.607Z",
//   location: "Paris",
//   public_key: "",
//   email: "company_02@montimage.com",
//   id_company: "montimage-paris-id"
// }, (id_company) => {
//   if (id_company != null) {
//     console.info("A new company has been created: ");
//     console.info(id_company);
//   }
// });

// getAllCompany((companies) => {
//   if (companies!=null) {
//     console.info(companies);
//   }
// });

// deleteCompany('montimage-company-id', (result) => {
//     if (result!= null) {
//       console.info('result: ');
//       console.info(result);
//     }
//   })

// registerPlugin({
//   id_company: "what-the-hell",
//   description: "Montimage IDS - provides security reports",
//   name: "Montimage IDS"
// }, (data) => {
//   if (data!=null) {
//     console.log(data);
//   }
// });

// registerPluginWithCompanyId("what-the-hell", (data) => {
//     console.log(data);
// });

// getPlugin('aa73c59a-9fde-4f6e-8130-1bdecf614950', (data) => {
//   if (data!= null) {
//     console.info('plugin data: ');
//     console.info(data);
//   }
// })

// sendSensorData(
// {
//   description: "This is the first data",
//   flag: '0',
//   geigerValue: "10",
//   maxValue: "100",
//   minValue: 0,
//   relation: "Montimage",
//   threatsImpact: '1f3eff0a-1817-4ede-aef7-8c836aecc1c1,High;',
//   urgency: 'high',
//   valueType: 'int'
// }, (result) => {
//   if (result != null) {
//     console.info(result);
//   }
// });

const timestamp = Date.now();

sendRecommendation(
  {
    action: "",
    costs: "False",
    longDescription: `Testing recommendation - ${timestamp}`,
    recommendationType: "device",
    relatedThreatsWeights: "1f3eff0a-1817-4ede-aef7-8c836aecc1c1,High;",
    shortDescription: `Recommendation 01 - ${timestamp}`
}, (result) => {
  if (result != null) {
    console.info(result);
  }
});

// sendRecommendationStatus("119b3018-0243-45d9-b26b-ea86bfbc859c", (result) => {
//     if (result != null) {
//       console.info(result);
//     }
//   });

// getAllEventByType('sensorStatus',(result) => {
//   console.log('result: ', result);
// })

// getAllRecommendations((result) => {
//   console.log('result: ', result);
// });

// getAllRecommendationStatus((result) => {
//   console.log(`Total number of data: ${result.length}`);
//   console.log('result: ', result);
// });

// getAllSensorDatas((result) => {
//     console.log('result: ', result);
//   });


// const info = getGeigerInfo();
// console.log(info);