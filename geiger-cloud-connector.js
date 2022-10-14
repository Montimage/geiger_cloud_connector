const {
  v4: uuidv4
} = require("uuid");

const {
  getRequest,
  postRequest,
  readJSONFileSync,
  writeToFile,
  putRequest,
  deleteRequest
} = require('./utils');

const GEIGER_CLOUD_CONFIGURATION = `${__dirname}/config.json`;
// const UNRESOLVED_RECOMMENDATIONS_PATH = `${__dirname}/recommendationIds.json`;

let config = null;
// let unresolveRecommendations = [];

const getConfig = () => config;

// const loadUnresolvedRecommendations = () => {
//   if (unresolveRecommendations.length === 0) {
//     let recs = readJSONFileSync(UNRESOLVED_RECOMMENDATIONS_PATH);
//     if (recs) {
//       unresolveRecommendations = recs.recommendations ?? [];
//     }
//   }
// };

// const updateUnresolveRecommendations = () => {
//   return writeToFile(UNRESOLVED_RECOMMENDATIONS_PATH, JSON.stringify({
//     recommendations: unresolveRecommendations
//   }), (err, ret) => {
//     if (err) {
//       console.error('Failed to update the unresolved recommendation list');
//     } else {
//       console.log('The unresolved recommendation list has been updated!');
//     }
//   });
// };


/**
 * Load the configuration file
 */
const loadConfig = () => {
  config = readJSONFileSync(GEIGER_CLOUD_CONFIGURATION);
  if (!config.id_company) {
    console.warn('id_company is not set');
  }

  // if (!config.plugin_id) {
  //   console.warn('plugin_id is not set');
  // }

  // if (!config.owner_id) {
  //   console.warn('owner_id is not set');
  // }

  if (!config.geigerAPIURL) {
    console.warn('Missing geigerAPIURL');
  }

  // loadUnresolvedRecommendations();
};


/**
 * Update the configuration file
 */
const updateConfig = (callback) => {
  console.log(`[updateConfig] Going to save a new config:\n ${JSON.stringify(config)}`);
  if (!config.id_company && config.company && config.company.id_company) {
    config.id_company = config.company.id_company;
  }

  if (!config.plugin_id && config.plugin && config.plugin.plugin_id) {
    config.plugin_id = config.plugin.plugin_id;
  }

  // if (!config.owner_id) {
  //   config.owner_id = uuidv4();
  // }

  writeToFile(GEIGER_CLOUD_CONFIGURATION, JSON.stringify(config), (err, result) => {
    if (err) {
      console.error('Failed to update the configuration');
      console.error(err);
      return callback(null);
    } else {
      console.log('Configuration has been updated');
      console.log(config);
      return callback(config);
    }
  });
};

const updateConfigWithChangedValue = (key, newValue, callback) => {
  config[key] = newValue;
  console.log(`[updateConfigWithChangedValue] Going to save a new config:\n ${JSON.stringify(config)}`);
  writeToFile(GEIGER_CLOUD_CONFIGURATION, JSON.stringify(config), (err, result) => {
    if (err) {
      console.error('Failed to update the configuration');
      console.error(err);
      return callback(err);
    } else {
      console.log('Configuration has been updated');
      console.log(config);
      return callback(null, config);
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
      updateConfig((newConfig) => {
        if (!newConfig) {
          console.log(`Failed to update new configuration`);

        }
        return callback(id_company);
      });

    }
  });
};

/**
 * Update the company information with given company id
 * @param {Function} callback {error, company}
 * @returns
 */
const updateCompanyInfo = (id_company, callback) => {
  if (!config.id_company && !id_company) {
    console.error('id_company is not set. Please specify your company id');
    return callback({
      error: 'Please provide company id'
    });
  } else {
    const companyId = id_company ? id_company : config.id_company;
    console.log(`Company Id: ${companyId}`);
    const url = `${config.geigerAPIURL}/store/company/${companyId}`;
    getRequest(url, (err, company) => {
      if (err) {
        console.log(`Failed to get company with id: ${companyId}`);
        console.log(err.response);
        return callback({
          error: `Failed to get company info`
        });
      } else {
        config.company = company;
        config.plugin.companyName = company.name;
        config.company_name = company.name;
        updateConfig((newConfig) => {
          if (!newConfig) {
            console.log(`Failed to update new config`);
          }
          return callback({
            company
          });
        });
      }
    });
  }
};

///////////// PLUGIN ///////////////////
// const registerPluginWithDefaultInfo = (callback) => {
//   if (!config.plugin.description || !config.plugin.name) {
//     console.error('There is no plugin information');
//     return callback({
//       error: 'No plugin information'
//     });
//   }

//   let pluginId = config.plugin_id;
//   if (!pluginId) pluginId = uuidv4();

//   return registerPlugin({
//     description: config.plugin.description,
//     id: pluginId,
//     name: config.plugin.name
//   }, callback);
// };
/**
 * Register a plugin
 * @param {*} param0
 * @param {*} callback
 * @returns
 */
const registerPlugin = ({
  company_name,
  id_company,
  description,
  id,
  name
}, callback) => {

  if (!config.id_company && !id_company) {
    console.error('Missing company id! Cannot register the plugin: ', id);
    return callback({
      error: 'Missing company ID'
    });
  }

  if (!config.company_name && !company_name) {
    console.error('Missing company name! Going to get the company information');
    updateCompanyInfo(id_company, (data) => {
      const {
        error,
        company
      } = data;
      if (error) {
        console.error(`Cannot register the plugin: ${id}`);
        return callback({
          error
        });
      } else {
        return registerPlugin({
          id_company: company.id_company,
          company_name: company.company_name,
          description,
          id,
          name
        }, callback);
      }
    });
  } else {
    // if (config.company_name !== company_name) {
    //   console.warn(`Company name is not correct! The given company name is: ${company_name}`);
    //   return callback({error: 'Company name is not matched'});
    // }

    if (config.plugin_registered == true && config.plugin) {
      console.log('Plugin has been registered already!');
      return callback({
        geigerInfo: getGeigerInfo()
      });
    }

    const url = `${config.geigerAPIURL}/plugin`;
    let pluginId = id ? id : (config.plugin_id ? config.plugin_id : uuidv4());
    let postData = {
      companyName: company_name ? company_name : config.company_name,
      description,
      id: pluginId,
      name
    };
    postRequest(url, postData, (err, data) => {
      if (err) {
        console.log(`Failed to register a plugin:\n ${JSON.stringify(err)}`);
        console.log(err);
        console.log(`Plugin data: ${JSON.stringify(postData)}`);
        return callback({
          error: `Failed to register a plugin`
        });
      } else {
        config.plugin_id = pluginId;
        config.plugin = {
          companyName: config.company_name,
          id: pluginId,
          name,
          description
        };
        config.plugin_registered = true;
        if (!config.id_company) {
          updateCompanyInfo(id_company, (companyInfo) => {
            const {
              error,
              company
            } = companyInfo;
            if (error) {
              console.log(`Failed to update company info of ${id_company}`);
              return callback({
                error
              });
            } else {
              return callback({
                geigerInfo: getGeigerInfo()
              });
            }
          });
        } else {
          updateConfig((newConfig) => {
            if (!newConfig) {
              console.log(`Failed to update new config`);
            }
            return callback({
              geigerInfo: getGeigerInfo()
            });
          });
        }
      }
    });
  }


};

const registerPluginWithCompanyId = (companyId, callback) => {
  registerPlugin({
    ...config.plugin,
    id_company: companyId,
  }, callback);
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

/////// EVENT //////////////
/**
 *
 * @param {*} eventId event id
 * @param {*} callback (event) =>
 * @returns
 */
const getCompanyEvent = (eventId, callback) => {
  if (!config.id_company) {
    console.warn('Missing company_id. Cannot update an event');
    return callback(null);
  }

  if (!eventId) {
    console.warn('Missing eventId. Cannot update an event');
    return callback(null);
  }

  const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event/${eventId}`;

  getRequest(url, (err, data) => {
    if (err) {
      console.log(`Failed to get company (${config.id_company}) event (${eventId})`);
      return callback(null);
    } else {
      return callback(data);
    }
  });
};

const updateEvent = (eventId, content, callback) => {
  console.log(`Going to update event ${eventId} of the company ${config.id_company}`);
  getCompanyEvent(eventId, (event) => {
    if (event) {
      const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event/${eventId}`;
      delete event.last_modified;
      delete event.expires;
      delete event.content;
      let newEvent = {
        ...event,
        content: content
      };
      putRequest(url, newEvent, (err, result) => {
        if (err) {
          console.log(`Failed to update event (${eventId}) of the company ${config.id_company}: cannot update the event content`);
          console.log(err);
          return callback(null);
        } else {
          console.log(`Event (${eventId}) of the company ${config.id_company} has been updated`);
          return callback(newEvent);
        }
      });
    } else {
      console.log(`Failed to update event (${eventId}) of the company ${config.id_company}: cannot get the event`);
      return callback(null);
    }
  });
};

const addEvent = ({
  content,
  type,
  // id_event,
}, callback) => {

  if (!config.id_company) {
    console.warn('Missing company_id. Cannot send data');
    return callback(null);
  }
  // const eventId = id_event ? id_event : uuidv4();
  _sendEvent(content, type, callback);
};

const _sendEvent = (content, type, callback) => {
  console.log(`Going to add a new event of the company ${config.id_company}`);
  const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event`;
  const postData = {
    content,
    encoding: "ascii",
    language: 'en',
    owner: config.id_company,
    type,
    // id_event: eventId,
    tlp: "GREEN"
  };
  // console.log(`url: ${url}`);
  console.log(`postData: ${JSON.stringify(postData)}`);
  postRequest(url, postData, (err, newEventId) => {
    if (err) {
      console.error(`Failed to send an event of company: ${config.id_company}`);
      console.error(err);
      console.error({
        content,
        type,
        // id_event:eventId
      });
      return callback(null);
    } else {
      console.log(`---> An event has been added: ${JSON.stringify(newEventId)}`);
      return callback(newEventId);
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
  console.log('---> Going to add a new sensor data');
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
    name: name ? name : config.plugin ? config.plugin.name : 'Montimage IDS',
    pluginId: config.plugin_id,
    relation,
    threatsImpact,
    urgency,
    valueType,
  };

  return addEvent({
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
    shortDescription,
  },
  callback,
) => {

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

  if (!recommendationId) {
    console.error('Missing the recommendation ID');
    return callback(null);
  }

  const content = {
    action,
    costs,
    longDescription,
    recommendationId: recommendationId,
    pluginId: config.plugin_id,
    pluginName: config.plugin.name,
    recommendationType,
    relatedThreatsWeights,
    shortDescription,
  };
  return addEvent({
    content: JSON.stringify(content),
    type: 'sensorRecommendation',
  },
  (eventId) => {
    if (eventId) {
      return callback(eventId);
    } else {
      return callback(null);
    }
  },
);
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
  console.log(`---> Going to add a new recommendation status for property ${recommendationId}`);
  return addEvent({
    content: JSON.stringify(content),
    type: "sensorStatus",
  }, (data) => {
    if (data) {
      // if (unresolveRecommendations) {
      //   const index = unresolveRecommendations.indexOf(recommendationId);
      //   if (index > -1) {
      //     unresolveRecommendations.splice(index, 1);
      //   }
      //   // unresolveRecommendations.push(recommendationId);
      //   updateUnresolveRecommendations();
      // }

      return callback({
        recommendationId
      });
    } else {
      return callback(null);
    }
  });
};

/**
 * Get all event by type of current owner
 * @param {*} type
 * @param {*} callback
 * @returns
 */
const getAllEventByType = (type, callback) => {

  // if (!config.owner_id) {
  //   console.log(`Cannot get all event of: ${type}. Missing owner id`);
  //   return callback(null);
  // }

  const headers = {
    owner: config.id_company,
    type
  };

  const url = `${config.geigerAPIURL}/store/events`;
  getRequest(url, (err, data) => {
    if (err) {
      console.error(`Failed to get all event of type: ${type}`);
      console.error(err);
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
const getAllRecommendations = (callback) => {
  return getAllEventByType('sensorRecommendation', callback);
};

const getAllSensorDatas = (callback) => {
  return getAllEventByType('sensorCloudConnected', callback);
};

const getAllRecommendationStatus = (callback) => {
  return getAllEventByType('sensorStatus', callback);
};

const getGeigerInfo = () => {
  if (!config) {
    loadConfig();
  }

  return {
    id_company: config.id_company ? config.id_company : config.company ? config.company.id_company : null,
    company: config.company,
    plugin_id: config.plugin_id ? config.plugin_id : config.plugin.plugin_id,
    plugin: config.plugin,
    owner_id: config.id_company,
  };
};

/**
 * Delete an event of a company
 * @param {String} eventId Event id
 * @param {Function} callback (error) => call back function
 * @returns
 */
const deleteCompanyEvent = (eventId, callback) => {
  if (!config.id_company) {
    console.error('Missing company id');
    return callback({error: "Missing company id"});
  }
  console.log(`---> Going to delete event ${eventId} of company ${config.id_company}`);
  const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event/${eventId}`;
  deleteRequest(url, (err, data) => {
    if (err) {
      console.error(`Failed to delete event ${eventId} of company ${config.id_company}`);
      console.error(`${JSON.stringify(err)}`);
      return callback({error: `Failed to delete event ${eventId} of company ${config.id_company}`});
    } else {
      console.log(`Event ${eventId} of company ${config.id_company} has been deleted`);
      return callback(null);
    }
  });
};

/**
 * Get all company event ids
 * @param {Function} callback (err, ids) => call back function
 * @returns
 */
const getAllCompanyEventIds = (callback) => {
  if (!config.id_company) {
    console.error('Missing company id');
    return callback({error: "Missing company id"});
  }

  console.log(`---> Going to get all company event ids of company ${config.id_company}`);
  const url = `${config.geigerAPIURL}/store/company/${config.id_company}/event`;
  getRequest(url, (err, data) => {
    if (err) {
      console.error(`Failed to get event ids of company ${config.id_company}`);
      console.error(`${JSON.stringify(err)}`);
      return callback({error: `Failed to get all event ids of company ${config.id_company}`});
    }else {
      return callback(null, data);
    }
  });
};

/**
 * Delete all company events
 */
const deleteAllCompanyEvents = () => {
  if (!config.id_company) {
    console.error('Missing company id');
  } else {
    getAllCompanyEventIds((err, ids) => {
      if (err) {
        console.error('Failed to get all company event ids');
        console.error(`${JSON.stringify(err)}`);
      } else {
        _deleteCompanyEvents(ids);
        // for (let index = 0; index < ids.length; index++) {
        //   const eventId = ids[index];
        //   deleteCompanyEvent(eventId, (err, ret) => {
        //     if (err) {
        //       console.log(`Failed to delete event ${eventId}`);
        //       console.log(err);
        //     }else {
        //       console.log(`Event ${eventId} has been deleted`);
        //     }
        //   });
        // }
      }
    });
  }
};

const _deleteCompanyEvents = (ids) =>{
  console.log(`remain events: ${ids.length}`);
  if (ids.length > 0) {
    const eventId = ids.pop();
    deleteCompanyEvent(eventId, (err, ret) => {
      if (err) {
        console.log(`Failed to delete event ${eventId}`);
        console.log(err);
      }else {
        console.log(`Event ${eventId} has been deleted`);
      }
      _deleteCompanyEvents(ids);
    });
  }
};

loadConfig();

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
  getAllRecommendationStatus,
  getGeigerInfo,
  updateConfigWithChangedValue,
  // registerPluginWithDefaultInfo,
  getConfig,
  registerPluginWithCompanyId,
  getCompanyEvent,
  updateEvent,
  deleteCompanyEvent,
  getAllCompanyEventIds,
  deleteAllCompanyEvents
};
