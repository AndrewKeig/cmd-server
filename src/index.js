'use strict';

global.ROOT = process.cwd();
global.CONF = require('config');

const path = require('path');

const co = require('co');

const express = require('express');
const bodyParser = require('body-parser');
const requireAll = require('require-all');

const {forEach, map} = require('@ibrokethat/iter');

const initCmd = require('./lib/core/initCmd');
const bindToHttp = require('./lib/core/bindToHttp');
const e = require('./lib/core/errors');

const dbs = require('./lib/dbs');
const cmdCategories = requireAll(path.join(global.ROOT, global.CONF.paths.cmds));

//  we need to create a config object that is passed around at runtime
const cfg = {
    db: null,
    cmds: null,
    services: null
};


co(function* () {


    //  initialise all the cmds
    const cmds = map(cmdCategories, map(initCmd(cfg)));

    //  create a ref to all our cmds on the cmds object as we only have one app at the moment
    cfg.cmds = map(cmds, map((cmd) => cmd.handler || () => {}));


    //  connect to databases
    if (global.CONF.dbs) {

        const databases = yield dbs(global.CONF.dbs);

        cfg.db = databases.db;

        //  todo: call db init/upgrade scripts here
    }

    //  connect to services
    if (global.CONF.services) {

        //  todo: cfg.services =
    }


    //  bind the cmds to http server
    if (CONF.apis.paths) {

        //  create the http server
        let app = express();

        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

        forEach(CONF.apis.paths, bindToHttp(app, cmds, cfg));

        app.listen(CONF.app.port);

        console.log(`http server started on port ${CONF.app.port}`);
    }


    //  bind the cmds to socket server
    if (global.CONF.socket) {
        //  todo
    }

    //  bind the cmds to message broker
    if (global.CONF.message) {
        //  todo
    }



}).catch((err) => {

    console.log(err.message);
    console.log(err.stack);
});
