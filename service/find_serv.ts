import log4js from "../common/utils/log4js";
import { basename } from "path";
const logger = log4js.getLogger(basename(__filename));
///////////////////////////////////////////////////////
import Express = require("express");
import { ServerReq, FindReq } from "../readme/httpApi_find";
import { http_return } from "../common/service/http_server";
import { create_server_info, get_all_server_info, get_server_info } from "../manager/server_mgr";
import bodyParser = require('body-parser');

const app = Express();
app.use(bodyParser.json());
function start(http_ip: string, http_port: number) {
    //设置跨域访问
    app.all('*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1')
        res.header("Content-Type", "application/json;charset=utf-8");
        logger.debug("[%s] %s => %s", req.method, req.path, JSON.stringify(req.body));
        next();
    });

    app.listen(http_port, http_ip);
    logger.info("Find Server Running at %s:%s", http_ip, http_port);
}

// 服务注册
app.get("/create", (req, res) => {
    const server_info: ServerReq = req.body;
    create_server_info(server_info);
    http_return(res, {});
})

// 服务查询
app.get("/find", (req, res) => {
    const find_info: FindReq = req.body;
    http_return(res, { data: get_server_info(find_info.server_type, find_info.server_id) })
})

// 服务监控
app.get("/all", (req, res) => {
    http_return(res, { data: get_all_server_info() });
})

export { start as find_serv_start }
