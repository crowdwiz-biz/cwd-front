import React from "react";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";
import {Tabs, Tab} from "../Utility/Tabs";
import NewIcon from "../NewIcon/NewIcon";
import GeneralSettings from "./components/GeneralSettings";
import NodeSettings from "./components/NodeSettings";
import FaucetSettings from "./components/FaucetSettings";
import SettingsStore from "stores/SettingsStore";
import ls from "common/localStorage";
import IntlStore from "stores/IntlStore";
import AltContainer from "alt-container";
import willTransitionTo from "../../routerTransition";

//STYLES
import "./scss/app-settings.scss";

class AppSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alert: false
        };
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    resetSettings() {
        SettingsActions.clearSettings().then(() => {
            this.setState({
                alert: true
            });

            this.timer = setTimeout(() => {
                this.setState({alert: false});
            }, 2000);
            const autoSelectionUrl = "wss://fake.automatic-selection.com";

            SettingsActions.changeSetting({
                setting: "apiServer",
                value: autoSelectionUrl
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
        });
    }

    render() {
        let ss = new ls("__graphene__");

        let verificationWord = SettingsStore.getState().settings.get(
            "verification"
        );
        let currentLocale = SettingsStore.getState().settings.get("locale");
        let lockTimeout = parseInt(ss.get("lockTimeout", 600), 10);
        let showSettles = SettingsStore.getState().settings.get("showSettles");
        let faucetAddress = SettingsStore.getState().settings.get(
            "faucet_address"
        );

        let url_string = window.location.href;
        let url = new URL(url_string);
        let activeTab = parseInt(url.searchParams.get("access"));

        let deviceWidth = window.innerWidth;

        return (
            <section className="app-settings__wrap">
                <div className="app-settings__header">
                    <Translate
                        content="header.settings"
                        className="cwd-common__title"
                    />

                    <div className="app-settings__reset-wrap">
                        <button
                            className="app-settings__reset-btn noselect"
                            onClick={this.resetSettings.bind(this)}
                        >
                            <NewIcon
                                iconWidth={12}
                                iconHeight={13}
                                iconName={"settings_reset-icon"}
                            />

                            {deviceWidth > 576 ? (
                                <Translate content="settings.reset" />
                            ) : (
                                <Translate content="settings.reset_mobile" />
                            )}
                        </button>

                        {this.state.alert ? (
                            <Translate
                                className="app-settings__alert"
                                content="settings.restore_default_success"
                            />
                        ) : null}
                    </div>
                </div>

                <Tabs
                    className="underlined-tabs"
                    tabsClass="underlined-tabs__list"
                    contentClass="underlined-tabs__content"
                    segmented={false}
                    actionButtons={false}
                    indicatorColor="primary"
                    textColor="primary"
                    defaultActiveTab={activeTab ? activeTab : 0}
                >
                    <Tab title="settings.general">
                        <GeneralSettings
                            currentLocale={currentLocale}
                            verificationWord={verificationWord}
                            lockTimeout={lockTimeout}
                            showSettles={showSettles}
                        />
                    </Tab>
                    <Tab title="settings.access">
                        <NodeSettings />
                    </Tab>
                    <Tab title="settings.faucet_address">
                        <FaucetSettings faucetAddress={faucetAddress} />
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

class AppSettingsContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[SettingsStore]}
                inject={{
                    settings: () => {
                        return SettingsStore.getState().settings;
                    },
                    viewSettings: () => {
                        return SettingsStore.getState().viewSettings;
                    },
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    localesObject: () => {
                        return IntlStore.getState().localesObject;
                    },
                    apiLatencies: () => {
                        return SettingsStore.getState().apiLatencies;
                    },
                    connectedNode: () => {
                        return SettingsStore.getState().settings.get(
                            "activeNode"
                        );
                    }
                }}
            >
                <AppSettings {...this.props} />
            </AltContainer>
        );
    }
}

export default AppSettingsContainer;
