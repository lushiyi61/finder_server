import log4js from "../common/utils/log4js";
import { basename } from "path";
const logger = log4js.getLogger(basename(__filename));
///////////////////////////////////////////////////////
import { ServerReq } from "../common/findserv/readme/httpApi_find";


const SERVER_MAP_MAP = new Map<string, Map<string, ServerReq>>()  // K:服务类型  V:MAP k:服务ID v:服务
enum LOAD_TYPE { NO_LOAD } // 负载方案

/**
 * 删除超时的服务器
 */
function delete_die_server(out_time: number) {
    const now = Date.now();
    const new_out_time = 2 * out_time;
    for (let key_type in SERVER_MAP_MAP) {
        const server_map_info = SERVER_MAP_MAP.get(key_type);
        for (let key_id in server_map_info) {
            const server_info = server_map_info.get(key_id);
            if (now > server_info.tick_time + new_out_time) {
                logger.warn("A service is died. type:%s, id:%s", server_info.server_type, server_info.server_id);
                server_map_info.delete(key_id);
            }
        }
        if (server_map_info.size == 0) {
            SERVER_MAP_MAP.delete(key_type);
        }
    }
    // logger.debug(SERVER_MAP_MAP);
    setTimeout(delete_die_server, 2000, out_time);
}

export function create_server_info(server_info: ServerReq) {
    const { ws_ip, ws_port, http_ip, http_port, server_id, server_type } = server_info;
    //如果有必须 初始化服务器列表
    if (!SERVER_MAP_MAP.has(server_type)) SERVER_MAP_MAP.set(server_type, new Map<string, ServerReq>());
    const server_map_info = SERVER_MAP_MAP.get(server_type);
    if (server_map_info.has(server_id)) {
        const old_server_info = server_map_info.get(server_id);
        if (old_server_info.ws_ip != ws_ip ||
            old_server_info.ws_port != ws_port ||
            old_server_info.http_ip != http_ip ||
            old_server_info.http_port != http_port
        ) {
            logger.info(server_info); // 服务有更新
        }
    } else {
        logger.info("there is new server connected, server type is ", server_type);
    }
    server_info.tick_time = Date.now();
    server_map_info.set(server_id, server_info);

    // logger.info("type:%s id:%s load:%d mem:%s",
    // server_info.server_type, server_info.server_id, server_info.load, server_info.memory);
}

export function get_all_server_info(): any {
    return SERVER_MAP_MAP;
}

/**
 * 获取指定服务，IP 和端口
 */
export function get_server_info(server_type: string, server_id?: string): ServerReq {
    let server_info: ServerReq = null;
    if (SERVER_MAP_MAP.has(server_type)) { // 服务存在
        const server_map_info = SERVER_MAP_MAP.get(server_type);
        if (server_id && server_map_info.has(server_id)) { // 获取指定服务器
            return server_map_info.get(server_id);
        } else {  // 负载均衡
            return get_min_load_entry(server_type);
        }
    }
    return server_info;
}

export function server_mgr_start(out_time: number) {
    logger.info("server manager start . out_time is: ", out_time);
    setTimeout(delete_die_server, 2000, out_time);
}

/**
 * 获取最小的负载入口
 */
function get_min_load_entry(server_type: string, load_type: LOAD_TYPE = LOAD_TYPE.NO_LOAD): ServerReq {
    //服务器列表，必须存在
    if (!SERVER_MAP_MAP.has(server_type)) return null;
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
                const server_infos: ServerReq[] = Object.values(SERVER_MAP_MAP.get(server_type));
                return server_infos[0];
            }
    }
}
