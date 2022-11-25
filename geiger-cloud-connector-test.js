const {createCompany, loadConfig, registerPlugin, sendSensorData, sendRecommendation, sendRecommendationStatus, getAllCompany, getAllSensorDatas, getAllEventByType, getAllRecommendations, getAllRecommendationStatus, getGeigerInfo, registerPluginWithCompanyId, getCompanyEvent, updateEvent, deleteCompanyEvent, getAllCompanyEventIds, deleteAllCompanyEvents} = require('./geiger-cloud-connector');

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

// registerPluginWithCompanyId(
//   "montimage-ids", (data) => {
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
//   description: JSON.stringify({
//     "en": "test english",
//     "de": "test german",
//     "nl": "test nl",
//     "ru": "test ru"
//   }),
//   flag: '0',
//   geigerValue: "10",
//   maxValue: "100",
//   minValue: "0",
//   relation: "Montimage",
//   threatsImpact: '1f3eff0a-1817-4ede-aef7-8c836aecc1c1,High;',
//   urgency: 'high',
//   valueType: 'int'
// }, (result) => {
//   if (result != null) {
//     console.info(result);
//   }
// });

// const timestamp = Date.now();

// sendRecommendation(
//   {
//     action: "",
//     costs: "False",
//     longDescription: `Testing recommendation - ${timestamp}`,
//     recommendationType: "device",
//     relatedThreatsWeights: "1f3eff0a-1817-4ede-aef7-8c836aecc1c1,High;",
//     shortDescription: `Recommendation 01 - ${timestamp}`
// }, (result) => {
//   if (result != null) {
//     console.info(result);
//   }
// });

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

// getCompanyEvent("5d95742b-4fb5-4f46-9f7f-b10c18d90433", (event)=>{
//   if (event) {
//     console.log(event);
//   }
// });

// updateEvent("72e40558-185f-4e50-8a05-9705339d7e93", "GEIGER is an awesome project", (newEvent) => {
//   if (newEvent) {
//     console.log(newEvent);
//   }
// });

// deleteCompanyEvent('72e40558-185f-4e50-8a05-9705339d7e93', (error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('OK');
//   }
// });

// getAllCompanyEventIds((err, ids) => {
//   if (err) {
//     console.log('Failed');
//     console.log(err);
//   } else {
//     console.log('All company event ids');
//     console.log(ids);
//   }
// });

deleteAllCompanyEvents();