import log4js from "./common/utils/log4js";
import { basename } from "path";
const logger = log4js.getLogger(basename(__filename));
///////////////////////////////////////////////////////
import config = require("./config.json");
import { find_serv_start } from "./service/find_serv";
import { server_mgr_start } from "./manager/server_mgr";

process.on('uncaughtException', function (err) {
    logger.fatal("uncaughtException=======================>\n", err);
});

if (config.ENV == 'dev') {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        if (chunk.indexOf('q') != -1) {
            logger.debug("sever shutdown.");
            process.exit(0);
        }
    });
}

logger.info("==========================程  序  启  动==========================");
//启动服务发现
const find_server = config.find_server;
find_serv_start(find_server.find_ip, find_server.find_port);
//定时清理僵尸服务
server_mgr_start(find_server.server_tick_time);
logger.info("==========================程序 启动 完毕==========================");
