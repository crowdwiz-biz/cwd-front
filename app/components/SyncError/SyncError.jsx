import React from "react";
import {connect} from "alt-react";
import BlockchainStore from "stores/BlockchainStore";
import SettingsStore from "stores/SettingsStore";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import NewIcon from "../NewIcon/NewIcon";
import WebsocketAddModal from "../Settings/WebsocketAddModal";
import AccessSettings from "../Settings/components/AccessSettings";

require("./sync-fail.scss");
require("../Settings/scss/all-settings.scss");

class SyncError extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAddNodeModalVisible: false,
            isRemoveNodeModalVisible: false,
            removeNode: {
                name: null,
                url: null
            }
        };

        this.showAddNodeModal = this.showAddNodeModal.bind(this);
        this.hideAddNodeModal = this.hideAddNodeModal.bind(this);
        this.showRemoveNodeModal = this.showRemoveNodeModal.bind(this);
        this.hideRemoveNodeModal = this.hideRemoveNodeModal.bind(this);
    }

    showAddNodeModal() {
        this.setState({
            isAddNodeModalVisible: true
        });
    }

    hideAddNodeModal() {
        this.setState({
            isAddNodeModalVisible: false
        });
    }

    showRemoveNodeModal(url, name) {
        this.setState({
            isRemoveNodeModalVisible: true,
            removeNode: {
                url,
                name
            }
        });
    }

    hideRemoveNodeModal() {
        this.setState({
            isRemoveNodeModalVisible: false,
            removeNode: {
                url: null,
                name: null
            }
        });
    }

    triggerModal(e) {
        this.refs.ws_modal.show(e);
    }

    onChangeWS(e) {
        SettingsActions.changeSetting({
            setting: "apiServer",
            value: e.target.value
        });
        Apis.reset(e.target.value, true);
        setTimeout(() => {
            this.onReloadClick();
        }, 50);
    }

    onReloadClick(e) {
        if (e) {
            e.preventDefault();
        }
        if (window.electron) {
            window.location.hash = "";
            window.remote.getCurrentWindow().reload();
        } else window.location.href = __BASE_URL__;
    }

    triggerModal(e, ...args) {
        this.refs.ws_modal.show(e, ...args);
    }

    render() {
        const {props} = this;

        return (
            <div>
                <div className="sync-fail__wrap" id="mainContainer">
                    <div className="sync-fail__header">
                        <Translate
                            className="sync-fail__title"
                            content="sync_fail.title"
                        />

                        <NewIcon
                            iconClass="sync-fail__clock-icon"
                            iconWidth={70}
                            iconHeight={70}
                            iconName={"clock"}
                        />

                        <div className="sync-fail__inner">
                            <Translate
                                content="sync_fail.sub_text_1"
                                component="p"
                            />

                            <Translate
                                unsafe
                                content="sync_fail.sub_text_2"
                                component="p"
                            />
                            <Translate
                                unsafe
                                content="sync_fail.sub_text_3"
                                component="p"
                            />
                        </div>
                    </div>

                    <section className="node-settings__wrap">
                        <AccessSettings
                            nodes={props.apis}
                            onChange={this.onChangeWS.bind(this)}
                            showAddNodeModal={this.showAddNodeModal}
                            showRemoveNodeModal={this.showRemoveNodeModal}
                        />
                    </section>
                </div>
            </div>
        );
    }
}

SyncError = connect(SyncError, {
    listenTo() {
        return [BlockchainStore, SettingsStore];
    },
    getProps() {
        return {
            rpc_connection_status: BlockchainStore.getState()
                .rpc_connection_status,
            apis: SettingsStore.getState().defaults.apiServer,
            apiServer: SettingsStore.getState().settings.get("apiServer"),
            defaultConnection: SettingsStore.getState().defaultSettings.get(
                "apiServer"
            ),
            apiLatencies: SettingsStore.getState().apiLatencies
        };
    }
});

export default SyncError;
