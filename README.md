# Retrieve AWS Load Balancer logs and push metrics to StatsD (via telegraf)

## Configuration

You need to configure the following environment variables:

| Variable | Description     |
| :------------- | :------------- |
| `AWS_ACCESS_KEY` | S3 Access Key Id       |
| `AWS_SECRET_KEY` | S3 Secret Key |
| `AWS_ACCOUNT_ID` | The AWS account ID of the owner      |
| `AWS_REGION` | The region for your load balancer and S3 bucket. |
| `AWS_BUCKET` | The name of the S3 bucket. |
| `AWS_LB` | The name of the load balancer. |
| `STATS_SERVER_HOST` | StatsD server address. |
| `STATS_SERVER_PORT` | StatsD server port. |

## Build docker image

```
$ npm install
$ tsc
$ docker build --force-rm -t aws_lb_logs_statsd .
$ docker-compose up -d
```

Put on cron to run every 5th minute

```
$ 1/5 * * * * docker exec awslblogsstatsd_aws_lb_logs_statsd_1 node dist/index.js
```
