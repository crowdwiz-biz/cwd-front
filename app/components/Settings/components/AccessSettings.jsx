import React from "react";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";
import willTransitionTo, {routerTransitioner} from "../../../routerTransition";
import {connect} from "alt-react";
import {Tabs, Tab} from "../../Utility/Tabs";
import NewIcon from "../../NewIcon/NewIcon";
import LoadingButton from "../../Utility/LoadingButton";
import Switch from "react-switch";
import NodeItem from "../components/NodeItem";
import counterpart from "counterpart";

const autoSelectionUrl = "wss://fake.automatic-selection.com";

function isTestNet(url) {
    if (url) {
        return !__TESTNET__ && url.indexOf("testnet") !== -1;
    } else {
        return false;
    }
}

/**
 * This class renders the auto-selection node
 */
class AutoSelectionNode extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * On activation routerTransitioner selects the best by itself. On deactivation the currently connected, or
     * last connected node is selected again.
     *
     * @param url
     */
    activate(url) {
        console.log("TCL: AutoSelectionNode -> activate -> url", url);
        SettingsActions.changeSetting({
            setting: "apiServer",
            value: url
        });
        if (
            SettingsStore.getSetting("activeNode") !=
            SettingsStore.getSetting("apiServer")
        ) {
            setTimeout(
                function() {
                    willTransitionTo(false);
                }.bind(this),
                50
            );
        }
    }

    render() {
        const {isActive, connectedNode, totalNodes, leftMenuMode} = this.props;

        if (leftMenuMode) {
            return (
                <div className="blockchain-menu-data__switch-inner">
                    <div className="blockchain-menu-data__switch-wrap">
                        <Switch
                            onChange={this.handleChange}
                            checked={isActive}
                            offColor={"#6d6d6d"}
                            onColor={"#141414"}
                            onHandleColor={"#DEC27F"}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            height={20}
                            width={36}
                            borderRadius={20}
                            checkedHandleIcon={
                                <NewIcon
                                    iconWidth={12}
                                    iconHeight={8}
                                    iconName={"checkmark"}
                                />
                            }
                            onChange={
                                connectedNode != null
                                    ? this.activate.bind(
                                          this,
                                          isActive
                                              ? connectedNode.url
                                              : autoSelectionUrl
                                      )
                                    : () => {}
                            }
                        />
                    </div>

                    <Translate
                        className="blockchain-menu-data__auto-text"
                        content="settings.automatic_short"
                    />
                </div>
            );
        } else {
            return (
                <div className="general-settings__switch-block">
                    <div className="general-settings__switch">
                        <Switch
                            onChange={this.handleChange}
                            checked={isActive}
                            offColor={"#6d6d6d"}
                            onColor={"#141414"}
                            onHandleColor={"#DEC27F"}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            height={20}
                            width={36}
                            borderRadius={20}
                            checkedHandleIcon={
                                <NewIcon
                                    iconWidth={12}
                                    iconHeight={8}
                                    iconName={"checkmark"}
                                />
                            }
                            onChange={
                                connectedNode != null
                                    ? this.activate.bind(
                                          this,
                                          isActive
                                              ? connectedNode.url
                                              : autoSelectionUrl
                                      )
                                    : () => {}
                            }
                        />
                    </div>

                    <Translate
                        className="app-settings__common-text app-settings__common-text--switch"
                        content="settings.automatic"
                        totalNodes={totalNodes}
                    />
                </div>
            );
        }
    }
}

/**
 * This class renders a a single node within the nodes list in the settings overview.
 *
 * This includes:
 *   - rendering the currently active node
 *   - render all other nodes with or without ping in the three sections:
 *      available, hidden, personal
 */
class ApiNode extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiServer: this.props.apiServer,
            removeNode: {
                name: null,
                url: null
            }
        };
    }

    /**
     * Nodes can only be activated, as switching only works by activating another
     * @param url
     */
    activate(url) {
        SettingsActions.changeSetting({
            setting: "apiServer",
            value: url
        });
        if (
            SettingsStore.getSetting("activeNode") !=
            SettingsStore.getSetting("apiServer")
        ) {
            setTimeout(
                function() {
                    willTransitionTo(false);
                }.bind(this),
                50
            );
        }
    }

    removeNode(e, url, name) {
        let apis = this.props.apis;
        let api = this.props.api;

        let removeIndex;
        apis.forEach((api, index) => {
            if (api.url === url) {
                removeIndex = index;
            }
        });

        /* Set default if removing currently active API server */
        if (api === apis[removeIndex].url) {
            SettingsActions.changeSetting.defer({
                setting: "apiServer",
                value: apis[0].url
            });
            this.props.changeConnection(apis[0].url);
        }

        SettingsActions.removeWS(removeIndex);
    }

    show(url) {
        SettingsActions.showWS(url);
    }

    hide(url) {
        SettingsActions.hideWS(url);
    }

    /**
     * Construct ping dict containing toString, color and rating.
     * @returns {*}
     * @private
     */
    _getPing() {
        if (isTestNet(this.props.node.url)) {
            return {
                toString: null,
                color: null,
                rating: null
            };
        }
        if (!this.props.node.ping) {
            return {
                toString: null,
                color: "high",
                rating: "node_down"
            };
        }
        if (this.props.node.ping == Infinity) {
            return {
                toString: null,
                color: "high",
                rating: "node_down"
            };
        }
        if (this.props.node.ping == -1) {
            return {
                toString: null,
                color: "high",
                rating: "skipped"
            };
        }
        let color, rating;
        let pingInMs = this.props.node.ping;
        if (pingInMs < 400) {
            color = "low";
            rating = "low_latency";
        } else if (pingInMs >= 400 && pingInMs < 800) {
            color = "medium";
            rating = "medium_latency";
        } else {
            color = "high";
            rating = "high_latency";
        }

        return {
            toString:
                pingInMs >= 1000
                    ? +(pingInMs / 1000).toFixed(2) + "s"
                    : pingInMs + "ms",
            color: color,
            rating: rating
        };
    }

    render() {
        const {node, isActive, leftMenuMode} = this.props;

        let ping = this._getPing();

        let url = node.url;

        let canBeHidden = !isActive;
        let canBeRemoved = !node.default && !isActive;

        let hidden = !!node.hidden;

        let location =
            !!node.location &&
            typeof node.location === "object" &&
            "translate" in node.location ? (
                <Translate component="span" content={node.location.translate} />
            ) : (
                node.location
            );

        let title = !!location ? location : "";
        if (!!node.country) {
            title = node.country + (!!title ? " - " + title : "");
        }
        if (!!node.region) {
            title = node.region + (!!title ? " - " + title : "");
        }

        if (leftMenuMode) {
            return (
                <div className="api-status">
                    <a>
                        <NewIcon
                            iconClass={ping.color + " default-icon"}
                            iconWidth={16}
                            iconHeight={16}
                            iconName={isActive ? "connected" : "disconnected"}
                            onClick={this.activate.bind(this, url)}
                        />
                        <NewIcon
                            iconClass={ping.color + " hover-icon"}
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"connect"}
                            onClick={this.activate.bind(this, url)}
                        />
                    </a>
                    {title}
                </div>
            );
        } else {
            return (
                <NodeItem
                    nodeName={title}
                    nodeUrl={url}
                    isActive={isActive}
                    latencyInfo={ping.rating}
                    latencyValue={ping.toString}
                    canBeHidden={canBeHidden}
                    isHidden={hidden}
                    canBeRemoved={canBeRemoved}
                    pingColor={ping.color}
                    changeConnection={apiServer => {
                        this.setState({apiServer});
                    }}
                    connectNode={this.activate.bind(this, url)}
                    hideNode={this.hide.bind(this, url)}
                    showNode={this.show.bind(this, url)}
                    removeNode={this.removeNode.bind(this)}
                />
            );
        }
    }
}

ApiNode.defaultProps = {
    node: {}
};

class AccessSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: "available_nodes",
            isLoading: false
        };
    }

    /**
     * Copies all keys in the default apiServer and adds the ping
     *
     * @param node
     * @returns {{ping: *}}
     */
    getNode(node) {
        const {props} = this;

        let nodeWrapper = {
            ping: props.apiLatencies[node.url]
        };
        Object.keys(node).forEach(key => {
            nodeWrapper[key] = node[key];
        });
        return nodeWrapper;
    }

    _getConnectedNode() {
        let connectedURL = null;
        let apis = SettingsStore.getState().defaults.apiServer;

        if (!this.props.connectedNode) {
            connectedURL = apis[0];
        } else {
            connectedURL = this.props.nodes.find(
                node => node.url == this.props.connectedNode
            );
        }
        if (!connectedURL) {
            connectedURL = autoSelectionUrl;
        }
        return this.getNode(connectedURL);
    }

    _connectedNodeIsPersonal() {
        if (!this.props.connectedNode) {
            return false;
        }
        let cn = this.props.nodes.find(
            node => node.url == this.props.connectedNode
        );
        return cn && this._nodeIsPersonal(cn);
    }

    _nodeIsPersonal(node) {
        return !node.default && !node.hidden && !isTestNet(node.url);
    }

    _getMainNetNodes() {
        return this.props.nodes.filter(a => {
            return !isTestNet(a.url);
        });
    }

    /**
     * @param node either a string (and then au
     * @param connectedNode
     * @returns {XML}
     */
    renderNode(node, connectedNode) {
        const {props} = this;

        if (node == null) return null;
        return (
            <ApiNode
                node={node}
                key={node.url}
                showRemoveNodeModal={props.showRemoveNodeModal}
                isActive={
                    connectedNode !== null && node.url == connectedNode.url
                }
                leftMenuMode={props.leftMenuMode}
                apis={this.props.apis}
                api={this.props.api}
            />
        );
    }

    renderAutoSelection(connectedNode) {
        const {props} = this;

        return (
            <AutoSelectionNode
                key={autoSelectionUrl + "_Auto_Selection"}
                isActive={props.selectedNode === autoSelectionUrl}
                connectedNode={connectedNode}
                totalNodes={this._getMainNetNodes().length}
                leftMenuMode={props.leftMenuMode}
            />
        );
    }

    _changeTab(tab) {
        this.setState({
            activeTab: tab
        });
    }

    _recalculateLatency(event, feedback) {
        this.setState({
            isLoading: true
        });
        routerTransitioner.doLatencyUpdate(true, true, 1).finally(() => {
            this.setState({
                isLoading: false
            });
        });
    }

    addPersonalNode() {
        let personalNodeUrl = document.getElementById("personalNodeUrl");
        let personalNodeName = document.getElementById("personalNodeName");

        if (personalNodeUrl.value != "" && personalNodeName.value != "") {
            SettingsActions.addWS({
                location: personalNodeName.value,
                url: personalNodeUrl.value
            });
            document.getElementById("personalNodeUrl").value = "";
            document.getElementById("personalNodeName").value = "";
        }
    }

    render() {
        const {props} = this;

        // placeholder to avoid this mismatch
        let getNode = this.getNode.bind(this);
        let renderNode = this.renderNode.bind(this);

        // currently selected and active node
        let connectedNode = this._getConnectedNode();

        let allNodesExceptConnected = props.nodes
            .map(node => {
                return getNode(node);
            })
            .filter(node => {
                return (
                    (connectedNode == null || node.url !== connectedNode.url) &&
                    node.url !== autoSelectionUrl
                );
            })
            .sort(function(a, b) {
                let isTestnet = isTestNet(a.url);
                if (!!a.ping && !!b.ping) {
                    return a.ping - b.ping;
                } else if (!a.ping && !b.ping) {
                    if (isTestnet) return -1;
                    return 1;
                } else if (!!a.ping && !b.ping) {
                    return -1;
                } else if (!!b.ping && !a.ping) {
                    return 1;
                }
                return 0;
            });

        let avaliableNodes = allNodesExceptConnected.filter(node => {
            return node.default && !node.hidden && !isTestNet(node.url);
        });
        let hiddenNodes = allNodesExceptConnected.filter(node => {
            return node.hidden && !isTestNet(node.url);
        });

        let personalNodes = allNodesExceptConnected.filter(node => {
            return this._nodeIsPersonal(node);
        });

        return this.props.leftMenuMode ? (
            <div className="blockchain-menu-data__switch-block">
                {this.renderAutoSelection(connectedNode)}
            </div>
        ) : (
            <div>
                <div className="node-settings__inner">
                    {this.renderAutoSelection(connectedNode)}

                    <div className="app-settings__header">
                        <Translate
                            content="settings.active_node"
                            className="app-settings__title"
                        />

                        <div className="app-settings__reset-wrap">
                            <LoadingButton
                                isLoading={this.state.isLoading}
                                caption="settings.ping"
                                loadingType="inside-feedback-resize"
                                loadingMessage="settings.ping"
                                onClick={this._recalculateLatency.bind(this)}
                                btnClass={"app-settings__reset-btn noselect"}
                            />
                        </div>
                    </div>

                    {renderNode(connectedNode, connectedNode)}
                </div>

                <Tabs
                    className="tabs-btn-view"
                    tabsClass="tabs-btn-view__list tabs-btn-view__list--settings"
                    contentClass="tabs-btn-view__content"
                    segmented={false}
                    actionButtons={false}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    {/* AVALIABLE NODES */}
                    <Tab title="settings.available_nodes">
                        <div className="node-settings__node-wrap">
                            {avaliableNodes.map(node => {
                                return renderNode(node, connectedNode);
                            })}
                        </div>
                    </Tab>

                    {/* PERSONAL NODES */}
                    <Tab title="settings.my_nodes">
                        <div className="node-settings__inner node-settings__inner--personal">
                            <div className="node-settings__personal-wrap">
                                <div className="general-settings__input-row">
                                    <Translate
                                        className="app-settings__common-text"
                                        content="settings.socket_name"
                                    />

                                    <input
                                        type="text"
                                        className="app-settings__input"
                                        placeholder={counterpart.translate(
                                            "settings.socket_name_placeholder"
                                        )}
                                        id="personalNodeName"
                                    />
                                </div>
                                <div className="general-settings__input-row">
                                    <Translate
                                        className="app-settings__common-text"
                                        content="settings.address"
                                    />

                                    <input
                                        type="text"
                                        className="app-settings__input"
                                        placeholder="wss://"
                                        id="personalNodeUrl"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="app-settings__btn noselect"
                                    onClick={this.addPersonalNode.bind(this)}
                                >
                                    <Translate content="settings.add_api" />
                                </button>
                            </div>

                            <div className="node-settings__node-wrap node-settings__node-wrap--personal">
                                {personalNodes.map(node => {
                                    return renderNode(node, connectedNode);
                                })}
                            </div>
                        </div>
                    </Tab>

                    {/* HIDDEN NODES */}
                    <Tab title="settings.hidden_nodes">
                        <div className="node-settings__node-wrap">
                            {hiddenNodes.length > 0 ? (
                                hiddenNodes.map(node => {
                                    return renderNode(node, connectedNode);
                                })
                            ) : (
                                <Translate content="settings.no_hidden_nodes" />
                            )}
                        </div>
                    </Tab>

                    {/* TEST NODES */}
                    <Tab title="settings.testnet_nodes" disabled={true}></Tab>
                </Tabs>
            </div>
        );
    }
}

AccessSettings = connect(AccessSettings, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            // apiServer and activeNode are ambiguous definition when dealing with isActive, autoSelectionActive etc..
            // using distinct names
            selectedNode: SettingsStore.getState().settings.get("apiServer"),
            connectedNode: SettingsStore.getState().settings.get("activeNode"),
            apiLatencies: SettingsStore.getState().apiLatencies,
            apis: SettingsStore.getState().defaults.apiServer,
            api: SettingsStore.getState().settings.get("apiServer")
        };
    }
});

export default AccessSettings;
