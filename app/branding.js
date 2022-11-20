/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "CrowdWiz";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url: "", // 2017-12-infrastructure worker proposal
        show: true,
        editable: false
    };
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */

export function getLogoPDF() {
    return require("assets/jpg-images/cwd-logo/logo-pdf.jpg");
}

/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
    // possible ["darkTheme", "lightTheme", "midnightTheme"]
    return "darkTheme";
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
    // possible: one of "password", "wallet"
    return "password";
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits(chainId = "4bb7d961") {
    if (chainId === "4bb7d961") return ["CWD", "GCWD", "CROWD.BTC"];
    else if (chainId === "a88a1ecf") return ["CWD"];
    // unknown chain id: (need to return at least one unit)
    else return ["CWD"];
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */

export function getMyMarketsBases() {
    return ["CWD"];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes() {
    let tokens = {
        nativeTokens: ["CWD", "GCWD", "CROWD.BTC"],
        bridgeTokens: ["BRIDGE.BCO", "BRIDGE.BTC", "BRIDGE.MONA", "BRIDGE.ZNY"],
        gdexTokens: ["GDEX.BTC", "GDEX.BTO", "GDEX.EOS", "GDEX.ETH"],
        openledgerTokens: [
            "OBITS",
            "OPEN.BTC",
            "OPEN.DASH",
            "OPEN.DGD",
            "OPEN.DOGE",
            "OPEN.EOS",
            "OPEN.EOSDAC",
            "OPEN.ETH",
            "OPEN.EURT",
            "OPEN.GAME",
            "OPEN.GRC",
            "OPEN.INCNT",
            "OPEN.KRM",
            "OPEN.LISK",
            "OPEN.LTC",
            "OPEN.MAID",
            "OPEN.MKR",
            "OPEN.NEO",
            "OPEN.OMG",
            "OPEN.SBD",
            "OPEN.STEEM",
            "OPEN.TUSD",
            "OPEN.USDT",
            "OPEN.WAVES",
            "OPEN.XMR",
            "OPEN.ZEC",
            "OPEN.ZRX"
        ],
        rudexTokens: [
            "PPY",
            "RUDEX.DCT",
            "RUDEX.DGB",
            "RUDEX.GBG",
            "RUDEX.GOLOS",
            "RUDEX.KRM",
            "RUDEX.MUSE",
            "RUDEX.SBD",
            "RUDEX.STEEM",
            "RUDEX.TT"
        ],
        sparkTokens: ["ZEPH", "SPARKDEX.ETH", "SPARKDEX.BTC"],
        xbtsxTokens: [
            "XBTSX.STH",
            "XBTSX.POST",
            "XBTSX.DOGE",
            "XBTSX.BTC",
            "XBTSX.LTC",
            "XBTSX.DASH",
            "XBTSX.KEC",
            "XBTSX.BTG",
            "XBTSX.XSPEC",
            "XBTSX.NVC",
            "XBTSX.42",
            "XBTSX.UNI",
            "XBTSX.NMC",
            "XBTSX.WAVES",
            "XBTSX.COF",
            "XBTSX.XRUP",
            "XBTSX.P2P",
            "XBTSX.STEEP"
        ],
        otherTokens: [
            "BKT",
            "BLOCKPAY",
            "BTWTY",
            "TWENTIX",
            "BTSR",
            "CADASTRAL",
            "CVCOIN",
            "HEMPSWEET",
            "HERO",
            "HERTZ",
            "ICOO",
            "IOU.CNY",
            "KAPITAL",
            "KEXCOIN",
            "OCT",
            "SMOKE",
            "STEALTH",
            "YOYOW"
        ]
    };

    let allTokens = [];
    for (let type in tokens) {
        allTokens = allTokens.concat(tokens[type]);
    }
    return allTokens;
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
    return [["CWD", "CROWD.BTC"]].filter(a => {
        if (!quotes.length) return true;
        return quotes.indexOf(a[0]) !== -1;
    });
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
    return [
        "OPEN.",
        "RUDEX.",
        "BRIDGE.",
        "GDEX.",
        "XBTSX.",
        "SPARKDEX.",
        "CITADEL."
    ];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for BitAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "OPEN.", "bit"
    return [];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    return (
        [
            "OPEN",
            "RUDEX",
            "BRIDGE",
            "GDEX",
            "XBTSX",
            "SPARKDEX",
            "CITADEL"
        ].indexOf(gateway) >= 0
    );
}

export function getSupportedLanguages() {
    // not yet supported
}

export function getAllowedLogins() {
    // possible: list containing any combination of ["password", "wallet"]
    return ["password", "wallet"];
}
