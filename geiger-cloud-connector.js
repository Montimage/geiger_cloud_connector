const {
  v4: uuidv4
} = require("uuid");

const fs = require("fs");

const {
  getRequest,
  postRequest,
  readJSONFileSync,
  writeToFile
} = require('./utils');

const GEIGER_CLOUD_CONFIGURATION = `${__dirname}/config.json`;

let config = null;
/**
 * Load the configuration file
 */
const loadConfig = () => {
  config = readJSONFileSync(GEIGER_CLOUD_CONFIGURATION);
  if (!config.id_company) {
    console.warn('id_company is not set');
  }

  if (!config.plugin_id) {
    console.warn('plugin_id is not set');
  }

  if (!config.owner_id) {
    console.warn('owner_id is not set');
  }

  if (!config.geigerAPIURL) {
    console.warn('Missing geigerAPIURL');
  }
};


/**
 * Update the configuration file
 */
const updateConfig = () => {
  writeToFile(GEIGER_CLOUD_CONFIGURATION, JSON.stringify(config), (err, result) => {
    if (err) {
      console.error('Failed to update the configuration');
      console.error(err);
    } else {
      console.log('Configuration has been updated');
      console.log(config);
    }
  });
};

///////////// COMPANY ///////////////////
/**
 * Get all the company
 * @param {Function} callback function to callback when it done
 */
const getAllCompany = (callback) => {
  const url = `${config.geigerAPIURL}/store/company`;
  getRequest(url, (err, companies) => {
    if (err) {
      console.log('Failed to get company');
      console.error(err.response.data.message);
      callback(null);
    } else {
      callback(companies);
    }
  })
}

// const deleteCompany = (id_company, callback) => {
//   const url = `${config.geigerAPIURL}/store/company/${id_company}`;
//   deleteRequest(url, (err, result) => {
//     if (err) {
//       console.log('Failed to delete company with id: ', id_company);
//       console.error(err.response.data.message);
//       callback(null);
//     } else {
//       callback(result);
//     }
//   })
// }
/***
 * Create a new company instance on Geiger Cloud
 */
const createCompany = ({
  company_name,
  company_users,
  email,
  founding_date,
  location,
  id_company,
  public_key
}, callback) => {
  const url = `${config.geigerAPIURL}/store/company`;
  const companyId = id_company ? id_company : uuidv4();
  console.log(`url: ${url}`);
  console.log(`companyId: ${companyId}`);
  postRequest(url, {
    company_name,
    company_users,
    email,
    founding_date,
    id_company: companyId,
    location,
    public_key
  }, (err, id_company) => {
    if (err) {
      console.log('Failed to create a new company');
      console.log({
        company_name,
        company_users,
        email,
        founding_date,
        companyId,
        location,
        public_key
      });
      console.error(err.response.data.message);
      return callback(null);
    } else {
      console.info('A new company has been created');
      console.log('Going to save the new company id into the configuration file');
      config.id_company = id_company;
      config.company_name = company_name;
      config.company = {
        company_name,
        company_users,
        email,
        founding_date,
        companyId,
        location,
        public_key
      };
      updateConfig();
      return callback(id_company);
    }
  });
};

/**
 * Update the company information with given company id
 * @param {Function} callback
 * @returns
 */
const updateCompanyInfo = (callback) => {
  if (!config.id_company) {
    console.error('id_company is not set. Please specify your company id');
    return callback(null);
  } else {
    const url = `${config.geigerAPIURL}/store/company/${config.id_company}`;
    getRequest(url, (err, company) => {
      if (err) {
        console.log('Failed to get company with id: ', config.id_company);
        console.error(err);
        return callback(null);
      } else {
        config.company = company;
        config.plugin.companyName = company.name;
        config.company_name = company.name;
        updateConfig();
        return callback(company);
      }
    });
  }
}


///////////// PLUGIN ///////////////////
/**
 * Register a plugin
 * @param {*} param0
 * @param {*} callback
 * @returns
 */
const registerPlugin = ({
  // companyName,
  description,
  id,
  name
}, callback) => {

  if (!config.id_company) {
    console.error('Missing company id! Cannot register the plugin: ', id);
    return callback(null);
  }

  if (!config.company_name) {
    console.error('Missing company name! Going to get the company information');
    updateCompanyInfo((company) => {
      if (!company) {
        console.error('Cannot register the plugin: ', id);
        return callback(null);
      } else {
        return registerPlugin({
          // companyName,
          description,
          id,
          name
        }, callback);
      }
    });
  }

  // if (config.company_name !== companyName) {
  // console.warn('Company name is not correct! The correct company name is: ', config.company_name);
  // return callback(null);
  // }

  if (config.plugin_registered == true && config.plugin) {
    console.log('Plugin has been registered already!');
    return callback(config.plugin);
  }

  const url = `${config.geigerAPIURL}/plugin`;
  let pluginId = id ? id : (config.plugin_id ? config.plugin_id : uuidv4());
  postRequest(url, {
    companyName: config.company_name,
    description,
    id: pluginId,
    name
  }, (err, data) => {
    if (err) {
      console.log('Failed to register a plugin');
      console.error(err.response.status);
      console.log('Plugin data: ');
      console.log({
        companyName: config.company_name,
        description,
        id: pluginId,
        name
      });
      return callback(null);
    } else {
      config.plugin_id = pluginId;
      config.plugin = {
        companyName: config.company_name,
        id: pluginId,
        name,
        description
      };
      config.plugin_registered = true;
      updateConfig();
      return callback(data);
    }
  });
};

// const getPlugin = (pluginId, callback) => {
//   const url = `${config.geigerAPIURL}/plugin/${pluginId}`;
//   getRequest(url, (err, plugin) => {
//     if (err) {
//       console.log('Failed to get plugin with id: ', pluginId);
//       console.error(err);
//       callback(null);
//     } else {
//       callback(plugin);
//     }
//   })
// }

const sendEvent = ({
  content,
  type,
  id_event,
}, callback) => {

  if (!config.id_company) {
    console.warn('Missing company_id. Cannot send data');
    return callback(null);
  }

  if (!config.owner_id) {
    console.warn('Missing owner_id. Going to generate once');
    config.owner_id = uuidv4();
    updateConfig();
  }

  const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event`;
  const eventId = id_event ? id_event : uuidv4();
  const postData = {
    content,
    encoding: "ascii",
    language: 'en',
    owner: config.owner_id,
    type,
    id_event: eventId,
    tlp: "GREEN"
  };
  console.log('url: ', url);
  console.log('postData: ');
  console.log(postData);
  postRequest(url, postData, (err, data) => {
    if (err) {
      console.error('Failed to send an event of company: ', id_company);
      console.error(err.response);
      console.error({
        content,
        type,
        id_event
      });
      return callback(null);
    } else {
      return callback(data);
    }
  });
};

/**
 * Send a sensorCloudConnected Tool
 * @param {*} param0
 * @param {*} callback
 * @returns
 */
const sendSensorData = ({
  description,
  flag,
  geigerValue,
  maxValue,
  minValue,
  name,
  relation,
  threatsImpact,
  urgency,
  valueType,

}, callback) => {

  if (!config.id_company) {
    console.error('Cannot send data. Missing company id.');
    return callback(null);
  }

  if (!config.plugin_id) {
    console.error('Cannot send data. Missing plugin id.');
    return callback(null);
  }

  const content = {
    description,
    flag,
    geigerValue,
    maxValue,
    minValue,
    name,
    pluginId: config.plugin_id,
    relation,
    threatsImpact,
    urgency,
    valueType,
  };

  return sendEvent({
    content: JSON.stringify(content),
    type: "sensorCloudConnected",
  }, callback);
};

/**
 * Send a recommendation
 * @param {*} param0
 * @param {*} callback
 */
const sendRecommendation = ({
  action,
  costs,
  longDescription,
  recommendationId,
  recommendationType,
  relatedThreatsWeights,
  shortDescription
}, callback) => {
  if (!config.id_company) {
    console.error('Cannot send data. Missing company id.');
    return callback(null);
  }

  if (!config.plugin_id) {
    console.error('Cannot send data. Missing plugin id.');
    return callback(null);
  }

  if (!config.plugin || !config.plugin.name) {
    console.error('Cannot send data. Missing plugin name.');
    return callback(null);
  }

  const recId = recommendationId ? recommendationId : uuidv4();
  const content = {
    action,
    costs,
    longDescription,
    recommendationId: recId,
    pluginId: config.plugin_id,
    pluginName: config.plugin.name,
    recommendationType,
    relatedThreatsWeights,
    shortDescription
  };

  return sendEvent({
    content: JSON.stringify(content),
    type: "sensorRecommendation",
  }, callback);
};

/**
 * Resolve a recommendation
 * @param {*} recommendationId
 * @param {*} callback
 * @returns
 */
const sendRecommendationStatus = (
  recommendationId,
  callback) => {
  if (!config.id_company) {
    console.error('Cannot send data. Missing company id.');
    return callback(null);
  }

  if (!config.plugin_id) {
    console.error('Cannot send data. Missing plugin id.');
    return callback(null);
  }

  if (!recommendationId) {
    console.error('Cannot send a recommendation status. Missing recommendation id.');
    return callback(null);
  }

  const content = {
    description: "Reflects the status of the recommendation with the indicated ID. geigerValue 0=resolved, 1=active",
    flag: "0",
    geigerValue: "0",
    maxValue: "1",
    minValue: "0",
    name: `Recommendation Status of ${recommendationId}`,
    pluginId: config.plugin_id,
    relation: "device",
    threatsImpact: "",
    urgency: "High",
    recommendationId,
    valueType: "int",
  };

  return sendEvent({
    content: JSON.stringify(content),
    type: "sensorStatus",
  }, callback);
};

/**
 * Get all event by type of current owner
 * @param {*} type
 * @param {*} callback
 * @returns
 */
const getAllEventByType = (type, callback) => {

  if (!config.owner_id) {
    console.log(`Cannot get all event of: ${type}. Missing owner id`);
    return callback(null);
  }

  const headers = {
    owner: config.owner_id,
    type
  }

  const url = `${config.geigerAPIURL}/store/events`;
  getRequest(url, (err, data) => {
    if (err) {
      console.error('Failed to get all event of type: ', type);
      console.error(err.response);
      return callback(null);
    } else {
      return callback(data);
    }
  }, headers);
};

/**
 * Get all recommendations
 * @param {*} callback
 * @returns
 */
const getAllRecommendations = (callback) =>{
  return getAllEventByType('sensorRecommendation', callback);
};

const getAllSensorDatas = (callback) =>{
  return getAllEventByType('sensorCloudConnected', callback);
};

const getAllRecommendationStatus = (callback) =>{
  return getAllEventByType('sensorStatus', callback);
};

module.exports = {
  loadConfig,
  createCompany,
  getAllCompany,
  // deleteCompany,
  registerPlugin,
  // getPlugin,
  sendSensorData,
  sendRecommendation,
  sendRecommendationStatus,
  getAllEventByType,
  getAllSensorDatas,
  getAllRecommendations,
  getAllRecommendationStatus
}