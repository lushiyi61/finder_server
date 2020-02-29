export const SERVER_REQUEST = {
    CREATE: "/create",
    FIND: "/find",
    ALL: "/all"
}


export interface ServerReq {
    server_type: string,    // 服务类型
    server_id: string,      // 服务ID
    tick_time: number;      // 心跳时间
    http_ip: string,
    http_port: number,
    ws_ip: string,
    ws_port: number,
    load: number,           // 负载
    memory: string,         // JSON 字符串
}

export interface ServerRes {
    http_ip: string,
    http_port: number,
    ws_ip: string,
    ws_port: number,
}


export interface FindReq {
    server_type: string;
    server_id?: string;
}
