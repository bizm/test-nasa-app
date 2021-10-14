# General information  
This is an implementation of test assignment that was specified as:
> Imagine a customer has asked you to build a tool that can show the following data on nearby asteroids using NASA’s APIs. The tool is required to do BOTH of the following things:
> * Show the asteroid that passed the closest to Earth between 19th December 2015 and 26th December 2015 and show its characteristics.
> * Show the largest asteroid (estimated diameter) during a user-selected year.

App was implemented as Express/Node server and a simple React frontend. It is packed as docker image and is deployed via AWS Fargate.

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
That is good enough for a small app like this!



https://advancedweb.hu/how-to-use-api-gateway-with-cloudfront/
https://medium.com/swlh/how-to-expose-aws-http-api-gateway-via-aws-cloudfront-16383f45704b
https://serebrov.github.io/html/2019-06-16-multi-origin-cloudfront-setup.html
https://advancedweb.hu/how-to-route-to-multiple-origins-with-cloudfront/
