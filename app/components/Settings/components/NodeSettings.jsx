import React, {Component} from "react";
import AltContainer from "alt-container";
import BindToChainState from "../../Utility/BindToChainState";
import CachedPropertyStore from "stores/CachedPropertyStore";
import BlockchainStore from "stores/BlockchainStore";
import SettingsStore from "stores/SettingsStore";
import AccessSettings from "./AccessSettings";

//STYLES
import "../scss/node-settings.scss";

class NodeSettings extends React.Component {
    constructor(props) {
        super(props);
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

    render() {
        const autoSelectAPI = "wss://fake.automatic-selection.com";

        // Current Node Details
        let nodes = this.props.defaults.apiServer;
        let currentNodeIndex = this.getCurrentNodeIndex.call(this);
        let activeNode = this.getNode(nodes[currentNodeIndex] || nodes[0]);
        if (activeNode.url == autoSelectAPI) {
            let nodeUrl = this.props.activeNode;
            currentNodeIndex = this.getNodeIndexByURL.call(this, nodeUrl);
            if (!!currentNodeIndex) {
                activeNode = this.getNode(nodes[currentNodeIndex]);
            } else {
                activeNode = this.getNode(nodes[0]);
            }
        }

        return (
            <section className="node-settings__wrap">
                <AccessSettings
                    nodes={this.props.defaults.apiServer}
                    leftMenuMode={false}
                />
            </section>
        );
    }
}

NodeSettings = BindToChainState(NodeSettings);

class AltNodeSettings extends Component {
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
                <NodeSettings {...this.props} />
            </AltContainer>
        );
    }
}

export default AltNodeSettings;
