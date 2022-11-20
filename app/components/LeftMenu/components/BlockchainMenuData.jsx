import React, {Component} from "react";
import AltContainer from "alt-container";
import Translate from "react-translate-component";
import BindToChainState from "../../Utility/BindToChainState";
import CachedPropertyStore from "stores/CachedPropertyStore";
import BlockchainStore from "stores/BlockchainStore";
import SettingsStore from "stores/SettingsStore";
import {ChainStore} from "bitsharesjs";
import ChainTypes from "../../Utility/ChainTypes";
import PropTypes from "prop-types";
import ifvisible from "ifvisible";
import AccessSettings from "../../Settings/components/AccessSettings";
import {routerTransitioner} from "../../../routerTransition";

//STYLES
import "../scss/blockchain-menu-data.scss";

class BlockchainMenuData extends React.Component {
    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
        synced: PropTypes.bool.isRequired
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0"
    };

    constructor(props) {
        super(props);
        this.state = {
            switchChecked: true,
            hasOutOfSyncModalBeenShownOnce: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.getNode = this.getNode.bind(this);
    }

    componentDidMount() {
        let ensure = this._ensureConnectivity.bind(this);
        ifvisible.on("wakeup", function() {
            ensure();
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._ensureConnectivity);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.rpc_connection_status !==
                this.props.rpc_connection_status ||
            nextProps.appVersion !== this.props.appVersion ||
            nextProps.synced !== this.props.synced ||
            nextProps.dynGlobalObject !== this.props.dynGlobalObject
        );
    }

    handleChange(switchChecked) {
        this.setState({switchChecked});
    }

    _ensureConnectivity() {
        // user is not looking at the app, no reconnection effort necessary
        if (!ifvisible.now("active")) return;

        let connected = !(this.props.rpc_connection_status === "closed");

        if (!connected) {
            console.log("Your connection was lost");
            setTimeout(() => {
                this._triggerReconnect();
            }, 50);
        } else if (!this.props.synced) {
            // If the blockchain is out of sync the footer will be rerendered one last time and then
            // not receive anymore blocks, meaning no rerender. Thus we need to trigger any and all
            // handling out of sync state within this one call

            let forceReconnectAfterSeconds = this._getForceReconnectAfterSeconds();
            let askToReconnectAfterSeconds = 10;

            // Trigger automatic reconnect after X seconds
            setTimeout(() => {
                if (!this.props.synced) {
                    this._triggerReconnect();
                }
            }, forceReconnectAfterSeconds * 1000);

            // Still out of sync?
            if (this.getBlockTimeDelta() > 3) {
                console.log(
                    "Your node is out of sync since " +
                        this.getBlockTimeDelta() +
                        " seconds, waiting " +
                        askToReconnectAfterSeconds +
                        " seconds, then we notify you"
                );
                setTimeout(() => {
                    // Only ask the user once, and only continue if still out of sync
                    if (
                        this.getBlockTimeDelta() > 3 &&
                        this.state.hasOutOfSyncModalBeenShownOnce === false
                    ) {
                        this.setState({
                            hasOutOfSyncModalBeenShownOnce: true
                        });
                    }
                }, askToReconnectAfterSeconds * 1000);
            }
        } else {
            setTimeout(() => {
                this.setState({
                    hasOutOfSyncModalBeenShownOnce: false
                });
            }, 50);
        }
    }

    getBlockTimeDelta() {
        try {
            let bt =
                (this.getBlockTime().getTime() +
                    ChainStore.getEstimatedChainTimeOffset()) /
                1000;
            let now = new Date().getTime() / 1000;
            return Math.abs(now - bt);
        } catch (err) {
            console.log(err);
            return -1;
        }
    }

    getBlockTime() {
        let dynGlobalObject = ChainStore.getObject("2.1.0");
        if (dynGlobalObject) {
            let block_time = dynGlobalObject.get("time");
            if (!/Z$/.test(block_time)) {
                block_time += "Z";
            }
            return new Date(block_time);
        } else {
            throw new Error("Blocktime not available right now");
        }
    }

    _triggerReconnect(honorManualSelection = true) {
        if (honorManualSelection && !routerTransitioner.isAutoSelection()) {
            return;
        }
        if (!routerTransitioner.isTransitionInProgress()) {
            console.log("Trying to reconnect ...");

            // reconnect to anythin
            let promise = routerTransitioner.willTransitionTo(false);
            if (!!promise)
                setTimeout(() => {
                    this.forceUpdate();
                }, 10);
            promise.then(() => {
                console.log("... done trying to reconnect");
            });
        }
    }

    _getForceReconnectAfterSeconds() {
        return 60;
    }

    getNode(node = {url: "", operator: ""}) {
        if (!node || !node.url) {
            throw "Node is undefined of has no url";
        }

        const {props} = this;

        const testNet = node.url.indexOf("testnet") !== -1;

        let title = node.operator + " " + !!node.location ? node.location : "";
        if ("country" in node) {
            title = node.country + (!!title ? " - " + title : "");
        }

        return {
            name: title,
            url: node.url,
            ping:
                node.url in props.apiLatencies
                    ? props.apiLatencies[node.url]
                    : -1,
            testNet
        };
    }

    getNodeIndexByURL(url) {
        let nodes = this.props.defaults.apiServer;
        let index = nodes.findIndex(
            node => !!node && !!node.url && node.url === url
        );
        if (index === -1) {
            return null;
        }
        return index;
    }

    getCurrentNodeIndex() {
        const {props} = this;
        let currentNode = this.getNodeIndexByURL.call(this, props.currentNode);

        return currentNode;
    }

    onNavigate(route) {
        this.props.history.push(route);
        if (window.innerWidth <= 768) {
            this.props.toggleOff();
        }
    }

    render() {
        const {props} = this;
        let apis = SettingsStore.getState().defaults.apiServer;
        let autoSelectAPI = "wss://fake.automatic-selection.com";
        let appVersion = this.props.appVersion;
        const connected = !(this.props.rpc_connection_status === "closed");
        let block_height = this.props.dynGlobalObject.get("head_block_number");

        // Current Node Details
        let nodes = this.props.defaults.apiServer;

        let currentNodeIndex = this.getCurrentNodeIndex.call(this);
        let activeNode = this.getNode(nodes[currentNodeIndex] || nodes[0]);

        if (activeNode.url == autoSelectAPI) {
            let nodeUrl = props.activeNode;
            currentNodeIndex = this.getNodeIndexByURL.call(this, nodeUrl);
            if (!!currentNodeIndex) {
                activeNode = this.getNode(nodes[currentNodeIndex]);
            } else {
                activeNode = this.getNode(nodes[0]);
            }
        }

        this._ensureConnectivity();

        return (
            <div className="blockchain-menu-data">
                <div className="blockchain-menu-data__data-inner">
                    <div className="blockchain-menu-data__row">
                        <span className="blockchain-menu-data__text">
                            CrowdWiz
                        </span>
                        <span className="blockchain-menu-data__value">
                            core-{appVersion}
                        </span>
                    </div>
                    <div className="blockchain-menu-data__row">
                        {!connected ? (
                            <Translate
                                className="blockchain-menu-data__current-node blockchain-menu-data__current-node--disconnected"
                                content="footer.disconnected"
                            />
                        ) : (
                            <span className="blockchain-menu-data__current-node">
                                {activeNode.name}
                            </span>
                        )}
                    </div>
                    <div className="blockchain-menu-data__row">
                        <Translate
                            className="blockchain-menu-data__text"
                            content="footer.latency"
                        />
                        <span className="blockchain-menu-data__value">
                            {!connected
                                ? "-"
                                : !activeNode.ping
                                ? "-"
                                : activeNode.ping + "ms"}
                        </span>
                    </div>
                    <div className="blockchain-menu-data__row">
                        <Translate
                            className="blockchain-menu-data__text"
                            content="footer.block"
                        />
                        <span className="blockchain-menu-data__value">
                            #{block_height}
                        </span>
                    </div>
                </div>

                <div className="blockchain-menu-data__btn-block">
                    <AccessSettings
                        nodes={this.props.defaults.apiServer}
                        leftMenuMode={true}
                    />

                    <div
                        onClick={this.onNavigate.bind(
                            this,
                            "/settings/?access=1"
                        )}
                        className="blockchain-menu-data__settings-btn"
                    >
                        <Translate
                            className="blockchain-menu-data__settings-btn-text"
                            content="footer.node_settings"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

BlockchainMenuData = BindToChainState(BlockchainMenuData);

class AltBlockchainMenuData extends Component {
    render() {
        return (
            <AltContainer
                stores={[CachedPropertyStore, BlockchainStore, SettingsStore]}
                inject={{
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    apiLatencies: () => {
                        return SettingsStore.getState().apiLatencies;
                    },
                    currentNode: () => {
                        return SettingsStore.getState().settings.get(
                            "apiServer"
                        );
                    },
                    activeNode: () => {
                        return SettingsStore.getState().settings.get(
                            "activeNode"
                        );
                    },
                    rpc_connection_status: () =>
                        BlockchainStore.getState().rpc_connection_status
                }}
            >
                <BlockchainMenuData {...this.props} />
            </AltContainer>
        );
    }
}

export default AltBlockchainMenuData;
