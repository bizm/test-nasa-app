# General information  

## Specification  
This is an implementation of test assignment that was specified as:
> Imagine a customer has asked you to build a tool that can show the following data on nearby asteroids using NASA’s APIs. The tool is required to do BOTH of the following things:
> * Show the asteroid that passed the closest to Earth between 19th December 2015 and 26th December 2015 and show its characteristics.
> * Show the largest asteroid (estimated diameter) during a user-selected year.

## Short intro  

App was implemented as Express/Node Web + API server and a simple React frontend. Whatever option is selected by user the data is fetched from NASA API for the whole year. We split the year into smaller intervals and fetch data for those separately, then combine and process. For each year we find the largest asteroid. Additionally we find the closest if requested year is 2015. This data is stored internally.

While data fetching from NASA API is in progress we return 202 response. That means FE should retry the same request later. In our case we just do polling until we get 200 or 500. There is Open API documentation in [openapi.yml](openapi.yml).

App is built as a docker image and deployed via AWS Fargate. There are Cloudformation templates under [aws](aws). For more information check [deployment in AWS](#deployment-in-aws).

## Imperfections  

This is a simple stupid implementation that is very far from being perfect. Here are some of the cut corners:
1. First of all there is very primitive in-memory cache. Instead we should've used some centralized solution &mdash; ElastiCache, DynamoDB, whatever.
2. Instead of implementing our own web server we should've used CloudFront. It might even be that serverless application model could be a good fit for this app &mdash; message queue and lambda for sure could do the job.
3. We don't use HTTPS. That's for the sake of simplicity only.
4. Instead of polling we could've used server-sent events. Maybe next time.
5. There are no FE tests, sorry!

# Development environment  

1. Create `.env` file under [dev](/dev) directory that looks like
    ```
    NASA_API_KEY=<your-NASA-API-key>
    ```
2. Run from [dev](/dev) directory
      ```shell
      docker-compose build && docker-compose up
      ```
    In container output you'll see combined logs from react-scripts and server that we run via `supervisor`.

3. Because of Windows directory mounting issues (yes, i'm using Windows) we don't mount anything. We just copy files into docker container when there any changes:
    ```shell
    docker cp src test-nasa-app:~
    docker cp client/src test-nasa-app:~/client
    docker cp client/public test-nasa-app:~/client
    # and so on
    ```
    That is good enough for a small app like this.

4. There are some jest tests for server app that you can try with `npm test`.

# Deployment in AWS  

There are Cloudformation templates for deploying app on AWS Fargate. Here's how you can try those.

1. Add your NASA API key as an AWS plaintext secret.
2. Create a CodeStar connection and allow access to your github repo (we assume here you're using your own fork).
3. Use [pipeline-vpc.yml](aws/pipeline-vpc.yml) template to create CodePipeline. You would need to specify ARN's of your NASA API key secret and CodeStart connection. Also you would need to change GitHub owner parameter. CloudFormation will create all the required resources and pipeline will be initiated.
4. In case of success CodeDeploy will deploy your application. You would see a running task under Elastic Container Service. A line in its logs saying `Listening on port 80` is a good indication of it being up and running.
5. To try your app just find dns name of Application Load Balancer and open it in your browser.

As you noticed pipeline template contains also VPC resources. Reason is that we need to overcome Docker limitation for poll quota and thus we use our VPC and subnet in CodeBuild. [Here](https://docs.aws.amazon.com/codebuild/latest/userguide/vpc-support.html) is more detailed explanation.

---

That's it. Thanks for reading this to the end. Have fun!
