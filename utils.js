const axios = require("axios");
const http = require("http");
const https = require("https");
const fs = require("fs");

let _axiosClient = null;
const getAxiosClient = () => {
  if (_axiosClient == null) {
    _axiosClient = axios.create({
      httpAgent: new http.Agent({
        keepAlive: true
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
        // ca: fs.readFileSync("./certs/192-168-159-129.pem"),
        // cert: fs.readFileSync("./certs/192-168-159-129.pem"),
        // checkServerIdentity: () => undefined,
        rejectUnauthorized: false,
      }),
    });
  }
  return _axiosClient;
};


const getRequest = (url, callback, headers) => {
  const axiosClient = getAxiosClient();
  axiosClient.get(url, {headers})
    .then((res) => {
      return callback(null, res.data);
    })
    .catch((error) => callback(error));
};

const postRequest = (url, data, callback) => {
  const axiosClient = getAxiosClient();
  axiosClient.post(url, data, {
    headers: {
      "Content-Type":"application/json"
    },
  })
  .then((res) => {
    return callback(null, res.data);
  })
  .catch((error) => callback(error));
};

const deleteRequest = (url, callback) => {
  const axiosClient = getAxiosClient();
  axiosClient.delete(url)
    .then((res) => {
      return callback(null, res.data);
    })
    .catch((error) => callback(error));
};

/**
 * Read async a JSON file
 * @param {String} filePath The path to the data file
 * @param {Function} callback The callback function
 */
 const readJSONFile = (filePath, callback) => {
  try {
    fs.readFile(filePath, (err, data) => {
      if (err) return callback(err);
      const jsonData = JSON.parse(data);
      return callback(null, jsonData);
    });
  } catch (error) {
    return callback(error);
  }
};

/**
 * Write a string data to a file
 * @param {String} filePath Path to the output file
 * @param {String} data data to be written
 * @param {Function} callback The callback function
 * @param {Boolean} isOverwrite The flag to indicate if the file should be overwrite or not
 */
const writeToFile = (_filePath, data, callback, isOverwrite = true) => {
  let filePath = _filePath;
  if (!isOverwrite) {
    if (fs.existsSync(filePath)) {
      // Need to change the file name;
      const extName = path.extname(_filePath);
      filePath = `${_filePath.replace(extName, '')}-${Date.now()}${extName}`;
    }
  }

  try {
    fs.writeFile(filePath, data, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  } catch (error) {}
};

/**
 * Read JSON file and return an JSON object
 * @param {String} filePath Path to file
 */
 const readJSONFileSync = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

const getUUID = () => v4();

module.exports ={
  getRequest,
  postRequest,
  deleteRequest,
  writeToFile,
  readJSONFile,
  readJSONFileSync,
};