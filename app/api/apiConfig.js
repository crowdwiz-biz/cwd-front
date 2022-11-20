import ls from "common/localStorage";
let ss = new ls("__graphene__");
// ============================
let host = window.location.hostname;

if(["127.0.0","192.168"].includes(host.substring(0, 7))) {
    host = "backup.cwd.global"
}

// ============================
ss.set("serviceApi", "https://" + host);

export const settingsAPIs = {
    // If you want a location to be translated, add the translation to settings in locale-xx.js
    // and use an object {translate: key} in WS_NODE_LIST
    DEFAULT_WS_NODE: "wss://fake.automatic-selection.com",
    WS_NODE_LIST: [
        {
            url: "wss://fake.automatic-selection.com",
            location: "Autodetect"
        },
        {
            url: "wss://"+host+"/ws",
            location: "Global"
        },
        {
            url: "wss://hg.cwd.wiki/ws",
            location: "Netherlands"
        }
    ],
    DEFAULT_FAUCET: "https://" + host + "/faucet",
    TESTNET_FAUCET: ""
};
