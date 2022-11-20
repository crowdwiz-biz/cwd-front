import React from "react";
import {Link} from "react-router-dom";
import {connect} from "alt-react";
import AccountStore from "stores/AccountStore";
import NewIcon from "../NewIcon/NewIcon";
import {Apis} from "bitsharesjs-ws";
import {ChainStore} from "bitsharesjs";
import UserHeaderBlock from "./components/UserHeaderBlock";
import ConnectIndicator from "../ConnectIndicator";
import MobileMenu from "../LeftMenu/MobileMenu";

// STYLES
import "./scss/header-wrap.scss";

class MobileHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            synced: this._syncStatus()
        };

        this.unlisten = null;
        this._syncStatus = this._syncStatus.bind(this);
    }

    componentDidMount() {
        this.syncCheckInterval = setInterval(
            this._syncStatus.bind(this, true),
            5000
        );
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
            let blockTime =
                (this.getBlockTime().getTime() +
                    ChainStore.getEstimatedChainTimeOffset()) /
                1000;
            let now = new Date().getTime() / 1000;
            return Math.abs(now - blockTime);
        } catch (err) {
            return -1;
        }
    }

    componentWillUnmount() {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
        clearInterval(this.syncCheckInterval);
    }

    toggleMenu() {
        this.props.toggleMobileMenu();
    }

    _onGoBack(e) {
        e.preventDefault();
        window.history.back();
    }

    _onGoForward(e) {
        e.preventDefault();
        window.history.forward();
    }

    render() {
        let userContract = 0;
        if (this.props.account) {
            userContract = this.props.account.get("referral_status_type");
        }

        let appVersion = this.props.appVersion;
        let isMenuVisible = this.props.isMenuVisible;

        return (
            <div className="header-wrap header-wrap--mobile">
                <div className="header-wrap__inner header-wrap__inner--mobile">
                    <div className="header-wrap__logo-block header-wrap__logo-block--mobile">
                        <Link to={`/`}>
                            <NewIcon
                                iconWidth={28}
                                iconHeight={26}
                                iconName={"header_logo-mobile"}
                            />
                        </Link>

                        <ConnectIndicator />
                    </div>

                    <div className="header-wrap__user-block">
                        {this.props.currentAccount ? (
                            <UserHeaderBlock
                                userContract={userContract}
                                account={this.props.account}
                                history={this.props.history}
                            />
                        ) : null}
                    </div>

                    <div
                        className="header-wrap__auth-block"
                        onClick={this.toggleMenu.bind(this)}
                    >
                        <NewIcon
                            iconWidth={22}
                            iconHeight={16}
                            iconName={
                                !isMenuVisible
                                    ? "header_menu_btn"
                                    : "header_menu_btn-close"
                            }
                        />
                    </div>
                </div>

                {isMenuVisible ? (
                    <MobileMenu
                        history={this.props.history}
                        appVersion={appVersion}
                        closeMobileMenu={this.toggleMenu.bind(this)}
                        isMenuVisible={isMenuVisible}
                    />
                ) : null}
            </div>
        );
    }
}

export default MobileHeader = connect(MobileHeader, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
