'use strict'

// import { default as configSettings } from '../config/configurations';
const s3 = require('s3');
import * as Promise from 'bluebird';
Promise.promisifyAll(s3);

export class S3Client {
  private client: any;

  constructor(access_key: string, secret_key: string) {
    this.client = s3.createClient({
      s3Options: {
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        accessKeyId: access_key,
        secretAccessKey: secret_key
      },
    });
  }

  listObjects(bucket: string, prefix: string) {
    let params = {
      s3Params: {
        Bucket: bucket,
        Prefix: prefix
      }
    };
    return new Promise((resolve, reject) => {
      let all_data = [];
      let list = this.client.listObjects(params);
      list.on('data', (data) => data.Contents.forEach(o => all_data.push(o.Key)));
      list.on('end', () => resolve(all_data));
      list.on('error', (err) => reject(err));
    })
  }

  downloadFile(Bucket: string, localFile: string, filename: string): Promise<any> {
    var params = {
      localFile: localFile,
      s3Params: {
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
        Bucket: Bucket,
        Key: filename,
      },
    };
    return new Promise((resolve, reject) => {
      var downloader = this.client.downloadFile(params);
      downloader.on('end', () => resolve());
      downloader.on('error', (err) => reject(err));
    })
  }
}
