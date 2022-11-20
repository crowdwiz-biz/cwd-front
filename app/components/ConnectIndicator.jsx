import React, {Component} from "react";
import AltContainer from "alt-container";
import BindToChainState from "./Utility/BindToChainState";
import BlockchainStore from "stores/BlockchainStore";
import SettingsStore from "stores/SettingsStore";
import PropTypes from "prop-types";
import NewIcon from "./NewIcon/NewIcon";
import ifvisible from "ifvisible";
import {routerTransitioner} from "../routerTransition";

class ConnectIndicator extends React.Component {
    static propTypes = {
        synced: PropTypes.bool.isRequired
    };

    static defaultProps = {
        synced: true
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let ensure = this._ensureConnectivity.bind(this);
        ifvisible.on("wakeup", function() {
            ensure();
        });
    }

    _ensureConnectivity() {
        // user is not looking at the app, no reconnection effort necessary
        if (!ifvisible.now("active")) return;

        let connected = !(this.props.rpc_connection_status === "closed");

        if (!connected) {
            console.log("HEADER Your connection was lost");
            setTimeout(() => {
                this._triggerReconnect();
            }, 50);
        }
    }

    _triggerReconnect(honorManualSelection = true) {
        if (honorManualSelection && !routerTransitioner.isAutoSelection()) {
            return;
        }
        if (!routerTransitioner.isTransitionInProgress()) {
            console.log("HEADER Trying to reconnect ...");

            // reconnect to anythin
            let promise = routerTransitioner.willTransitionTo(false);
            if (!!promise)
                setTimeout(() => {
                    this.forceUpdate();
                }, 10);
            promise.then(() => {
                console.log("HEADER ... done trying to reconnect");
            });
        }
    }

    render() {
        this._ensureConnectivity();

        const connected = !(this.props.rpc_connection_status === "closed");

        return (
            <span className="header-wrap__bc-container">
                <NewIcon
                    iconClass={
                        connected
                            ? "bc_indicator bc_indicator--synced"
                            : "bc_indicator bc_indicator--error"
                    }
                    iconWidth={17}
                    iconHeight={17}
                    iconName={"bc_indicator"}
                />
            </span>
        );
    }
}
ConnectIndicator = BindToChainState(ConnectIndicator);

class AltConnectIndicator extends Component {
    render() {
        return (
            <AltContainer
                stores={[BlockchainStore, SettingsStore]}
                inject={{
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    rpc_connection_status: () =>
                        BlockchainStore.getState().rpc_connection_status
                }}
            >
                <ConnectIndicator {...this.props} />
            </AltContainer>
        );
    }
}

export default AltConnectIndicator;
