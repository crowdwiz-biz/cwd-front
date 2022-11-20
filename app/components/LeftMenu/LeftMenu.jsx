import React from "react";
import {connect} from "alt-react";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import WalletUnlockStore from "stores/WalletUnlockStore";
import LeftMenuItem from "./components/LeftMenuItem";
import {menuData} from "./components/LeftMenuData";
import {menuSettingsData} from "./components/LeftMenuSettingsData";
import BlockchainMenuData from "./components/BlockchainMenuData";

import "./scss/left-menu.scss";

class LeftMenu extends React.Component {
    constructor() {
        super();

        this.state = {
            toggle: false,
            synced: this._syncStatus(),
            leftMenu: menuData
        };

        this._syncStatus = this._syncStatus.bind(this);
    }

    componentDidMount() {
        this.syncCheckInterval = setInterval(
            this._syncStatus.bind(this, true),
            5000
        );
    }

    componentWillUnmount() {
        clearInterval(this.syncCheckInterval);
    }

    toggleOn() {
        this.setState({
            toggle: true
        });
    }

    toggleOff() {
        this.setState({
            toggle: false
        });
    }

    _syncStatus(setState = false) {
        let synced = this.getBlockTimeDelta() < 5;
        if (setState && synced !== this.state.synced) {
            this.setState({synced});
        }
        return synced;
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
            return -1;
        }
    }

    render() {
        let isToggled = this.state.toggle;
        let leftMenu = menuData;
        let leftMenuSettings = menuSettingsData;
        let membership_expiration_date = false;
        if (this.props.account) {
            let account = this.props.account.toJS();
            membership_expiration_date = account.membership_expiration_date;

            if (
                membership_expiration_date === "1969-12-31T23:59:59" ||
                membership_expiration_date === "1970-01-01T00:00:00"
            )
                membership_expiration_date = false;
            else {
                membership_expiration_date = true;
            }
        }

        return (
            <div
                className="leftmenu"
                onMouseOver={this.toggleOn.bind(this)}
                onMouseLeave={this.toggleOff.bind(this)}
            >
                <div
                    className={
                        isToggled
                            ? "leftmenu__container"
                            : "leftmenu__container--toggleOff"
                    }
                >
                    <ul className="leftmenu__ul">
                        {leftMenu.map(item =>
                            (this.props.locked &&
                                item.isLockedView &&
                                this.props.currentAccount != null) ||
                            (!this.props.locked &&
                                this.props.currentAccount != null) ||
                            (this.props.currentAccount == null &&
                                item.currentAccountView) ? (
                                <LeftMenuItem
                                    key={item.itemID}
                                    item={item}
                                    currentAccount={this.props.currentAccount}
                                    history={this.props.history}
                                    isToggled={isToggled}
                                    toggleOff={this.toggleOff.bind(this)}
                                />
                            ) : null
                        )}
                    </ul>

                    <ul className="leftmenu__ul leftmenu__ul--settings-block">
                        {leftMenuSettings.map(item =>
                            membership_expiration_date == true ||
                            (membership_expiration_date == false &&
                                this.props.currentAccount != null &&
                                item.serviceAccount == false) ||
                            (this.props.currentAccount == null &&
                                item.currentAccountView) ? (
                                <LeftMenuItem
                                    key={item.itemID}
                                    item={item}
                                    currentAccount={this.props.currentAccount}
                                    history={this.props.history}
                                    isToggled={isToggled}
                                    toggleOff={this.toggleOff.bind(this)}
                                />
                            ) : null
                        )}
                    </ul>

                    {isToggled ? (
                        <div className="leftmenu__footer-wrap">
                            <BlockchainMenuData
                                synced={this.state.synced}
                                history={this.props.history}
                                appVersion={this.props.appVersion}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

LeftMenu = connect(LeftMenu, {
    listenTo() {
        return [AccountStore, WalletUnlockStore];
    },
    getProps() {
        if (AccountStore.getState().currentAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount
                ),
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                passwordAccount: AccountStore.getState().passwordAccount,
                locked: WalletUnlockStore.getState().locked
            };
        } else {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                passwordAccount: AccountStore.getState().passwordAccount,
                locked: WalletUnlockStore.getState().locked
            };
        }
    }
});

export default LeftMenu;
