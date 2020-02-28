import log4js from "../common/utils/log4js";
import { basename } from "path";
const logger = log4js.getLogger(basename(__filename));
///////////////////////////////////////////////////////
import { Server_info } from "../common/service/api_find";

const SERVER_MAP_MAP = new Map<string, Map<string, Server_info>>()  // K:服务类型  V:MAP k:服务ID v:服务
enum LOAD_TYPE { NO_LOAD } // 负载方案

/**
 * 删除超时的服务器
 */
function delete_die_server(out_time: number) {
    const now = Date.now();
    const new_out_time = 2 * out_time;
    for (let key_type in SERVER_MAP_MAP) {
        const server_map_info = SERVER_MAP_MAP[key_type];
        for (let key_id in server_map_info) {
            const server_info = server_map_info[key_id];
            if (now > server_info.ticktime + new_out_time) {
                logger.warn("A service is die.   ", JSON.stringify(server_info));
                delete server_map_info[key_id];
            }
        }
        if (Object.keys(SERVER_MAP_MAP[key_type]).length == 0) {
            delete SERVER_MAP_MAP[key_type];
        }
    }
    // logger.debug(SERVER_MAP_MAP);
    setTimeout(delete_die_server, 2000, out_time);
}

export function create_server_info(server_info: Server_info) {
    const { ws_ip, ws_port, http_ip, http_port, server_id, server_type } = server_info;
    //如果有必须 初始化服务器列表
    if (!SERVER_MAP_MAP[server_type]) SERVER_MAP_MAP[server_type] = new Map<string, Server_info>();
    const server_map_info: Map<string, Server_info> = SERVER_MAP_MAP[server_type];
    if (server_map_info[server_id]) {
        const old_server_info = server_map_info[server_id];
        if (old_server_info.ws_ip != ws_ip ||
            old_server_info.ws_port != ws_port ||
            old_server_info.http_ip != http_ip ||
            old_server_info.http_port != http_port
        ) {
            logger.info(server_info); // 服务有更新
        }
    }
    server_info.tick_time = Date.now();
    server_map_info[server_id] = server_info;

    // logger.info("type:%s id:%s load:%d mem:%s",
    // server_info.server_type, server_info.server_id, server_info.load, server_info.memory);
}

export function get_all_server_info(): any {
    return SERVER_MAP_MAP;
}

/**
 * 获取指定服务，IP 和端口
 */
export function get_server_info(server_type: string, server_id?: string): Server_info {
    let server_info: Server_info = null;
    if (SERVER_MAP_MAP[server_type]) { // 服务存在
        const server_map_info = SERVER_MAP_MAP[server_type];
        if (server_id && server_map_info[server_id]) { // 获取指定服务器
            return server_map_info[server_id];
        } else {  // 负载均衡
            return get_min_load_entry(server_type);
        }
    }
    return server_info;
}

export function server_mgr_start(out_time: number) {
    setTimeout(delete_die_server, 2000, out_time);
}

/**
 * 获取最小的负载入口
 */
function get_min_load_entry(server_type: string, load_type: LOAD_TYPE = LOAD_TYPE.NO_LOAD): Server_info {
    //服务器列表，必须存在
    if (!SERVER_MAP_MAP[server_type]) return null;
    /**
     * 负载方案
     * 1：无负载
     * 2：平均值负载
     * 3：最低值负载
     * 4: 随机负载
     */
    switch (load_type) {
        case LOAD_TYPE.NO_LOAD:
        default:
            {
                const server_infos: Server_info[] = Object.values(SERVER_MAP_MAP[server_type]);
                return server_infos[0];
            }
    }
}
