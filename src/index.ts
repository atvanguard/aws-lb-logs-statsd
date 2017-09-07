import { S3Client } from './S3Client';

import * as Promise from 'bluebird'
import _ = require('lodash');
import fs = require('fs');
import StatsD = require('node-statsd');
import moment = require("moment")

const statsDClient = new StatsD({
  "host" : process.env.STATS_SERVER_HOST,
  "port" : process.env.STATS_SERVER_PORT,
});

let s3Client = new S3Client(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY);
let files = [];
let date = moment().utc().subtract({minutes: 1});
let pattern = `AWSLogs/${process.env.AWS_ACCOUNT_ID}/elasticloadbalancing/${process.env.AWS_REGION}/${date.format('YYYY/MM/DD')}/${process.env.AWS_ACCOUNT_ID}_elasticloadbalancing_${process.env.AWS_REGION}_${process.env.AWS_LB}_${date.format('YYYYMMDDTHHmm')}`;
console.log(`Retrieving log files with prefix ${pattern}`);
s3Client.listObjects(process.env.AWS_BUCKET, pattern)
.then(objectKeys => {
  return Promise.map(objectKeys, key => {
    files.push(key.replace(/\//g , "_"));
    return s3Client.downloadFile(process.env.AWS_BUCKET, key.replace(/\//g , "_"), key);
  });
})
.then(() => {
  files.forEach(file => {
    console.log(`Processing ${file}`);
    let data = fs.readFileSync(file).toString().split('\n').filter(Boolean);
    data.forEach((logLine: any) => {
      logLine = logLine.split(' ');
      let logObject = {
        timestamp: logLine[0],
        elb: logLine[1],
        client: logLine[2],
        backend: logLine[3],
        request_processing_time: logLine[4],
        backend_processing_time: logLine[5],
        response_processing_time: logLine[6],
        elb_status_code: logLine[7],
        backend_status_code: logLine[8],
        request_method: logLine[11],
        request_url: logLine[12],
      }
      statsDClient.increment(`elb_stats.${parseInt(logObject.elb_status_code)}`);
      statsDClient.timing(`elb_stats.latency`, (parseFloat(logObject.request_processing_time) + parseFloat(logObject.backend_processing_time)) * 1000);
    });
  });
  setTimeout(() => process.exit(0), 5000);
})
.catch(e => console.log(e));
