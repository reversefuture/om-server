# Intro
Template: https://github.com/ljlm0402/typescript-express-starter?tab=readme-ov-file
## nodemon
nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.
>nodemon [your node app]
eg:
>nodemon ./server.js localhost 8080

## ts-node
This is a TypeScript execution environment and REPL for Node.js. It allows you to directly run TypeScript files without having to compile them first.

Runs your TypeScript file using ts-node and ensures that module paths are resolved correctly based on the paths configured in your tsconfig.json file using tsconfig-paths/register:
>ts-node -r tsconfig-paths/register --transpile-only <your-index-file>.ts
- -r tsconfig-paths/register: This flag (-r) tells ts-node to register the tsconfig-paths/register module before running your TypeScript file.
- --transpile-only: execute the code instead of showing transpilation result 

## docker
Docker is a platform for developers and sysadmins to build, run, and share applications with containers.

starts the containers in the background and leaves them running :
>docker-compose up -d

Stops containers and removes containers, networks, volumes, and images : 
>docker-compose down

Modify docker-compose.yml and Dockerfile file to your source code.

## Nginx
NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache.

Proxying is typically used to distribute the load among several servers, seamlessly show content from different websites, or pass requests for processing to application servers over protocols other than HTTP.

When NGINX proxies a request, it sends the request to a specified proxied server, fetches the response, and sends it back to the client.

Modify nginx.conf file to your source code.

## Swagger :: API Document
Swagger is Simplify API development for users, teams, and enterprises with the Swagger open source and professional toolset.

Easily used by Swagger to design and document APIs at scale.

Start your app in development mode at http://localhost:3000/api-docs

Modify swagger.yaml file to your source code.

##  REST Client :: HTTP Client Tools
REST Client allows you to send HTTP request and view the response in Visual Studio Code directly.

VSCode Extension REST Client Install.

Modify *.http file in src/http folder to your source code.

## PM2 :: Advanced, Production process manager for Node.js
PM2 is a daemon process manager that will help you manage and keep your application online 24/7.

>production mode :: npm run deploy:prod or pm2 start ecosystem.config.js --only prod
>development mode :: npm run deploy:dev or pm2 start ecosystem.config.js --only dev

Modify ecosystem.config.js file to your source code.

## SWC :: a super-fast JavaScript / TypeScript compiler
SWC is an extensible Rust-based platform for the next generation of fast developer tools.

SWC is 20x faster than Babel on a single thread and 70x faster on four cores.

>tsc build :: npm run build
>swc build :: npm run build:swc
Modify .swcrc file to your source code.

## Makefile :: This is a setting file of the make program used to make the compilation that occurs repeatedly on Linux
Makefiles are used to help decide which parts of a large program need to be recompiled.

>help :: make help

Modify Makefile file to your source code.



s