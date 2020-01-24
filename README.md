## Overview

Simple API for manage information about organizations: names and relations.
Built with Express.js - 4.15.2 for Ubuntu servers.

Available endpoints:

POST /api/organizations
```
Input format:
 {
   "org_name": "org1",
   "daughters":[
       {
           "org_name": "org2",
               "daughters": [...]
       },
       ...
       ]
 }

```

GET /api/organizations/:name/relations
```
Output format:
[{
"relationship_type": "parent",
"org_name": "org1"
}, {
"relationship_type": "sister",
"org_name": "org2"
},
...
]
```

### Getting Started

Clone the repo:
```sh
git clone git@github.com:dmitriyvelichkodev/node_api.git
cd node_api
```

Install docker:
https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#uninstall-docker-ce
Docker version 17.06.0-ce

Install docker-compose:
https://docs.docker.com/compose/install/#install-compose
docker-compose version 1.16.1

Install yuidoc globally(If need regenerate documentation):
```js
npm install -g yuidoc
```

Build and run containers:
```sh
sudo docker-compose up
```

In webserver container available options for running are:
- npm start - sets NODE_ENV to `development`
- npm test - sets NODE_ENV to `test`
- npm prod - sets NODE_ENV to `production`

By default container runs with npm start.


##### Tests
1) enter docker webserver container
2) run inside ```npm test```

##### Docs
Docs are availbale on docs folder - docs/index.html

## License
This project is licensed under the [MIT License]
