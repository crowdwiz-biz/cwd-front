import React from "react";
import {Link} from "react-router-dom";
import {connect} from "alt-react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import NewIcon from "../NewIcon/NewIcon";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import {Apis} from "bitsharesjs-ws";
import {ChainStore} from "bitsharesjs";
import DynamicMenuItem from "./components/DynamicMenuItem";
import UserHeaderBlock from "./components/UserHeaderBlock";
import ConnectIndicator from "../ConnectIndicator";
import Translate from "react-translate-component";

// STYLES
import "./scss/header-wrap.scss";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.location.pathname
        };

        this.unlisten = null;
    }

    UNSAFE_componentWillMount() {
        this.unlisten = this.props.history.listen(newState => {
            if (this.unlisten && this.state.active !== newState.pathname) {
                this.setState({
                    active: newState.pathname
                });
            }
        });
    }

    componentWillUnmount() {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
    }

    _toggleLock(e) {
        e.preventDefault();
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.getUserContract(this.props.currentAccount);
                })
                .catch(() => {});
        } else {
            WalletUnlockActions.lock();
        }
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
        let {active} = this.state;
        let userContract = 0;

        if (this.props.account) {
            userContract = this.props.account.get("referral_status_type");
        }

        return (
            <div className="header-wrap">
                <div className="header-wrap__inner">
                    <div className="header-wrap__logo-block">
                        <Link to={`/`}>
                            <NewIcon
                                iconClass={"header__logo"}
                                iconWidth={80}
                                iconHeight={25}
                                iconName={"header_logo"}
                            />
                        </Link>
                    </div>

                    <DynamicMenuItem active={active} />

                    {!this.props.currentAccount &&
                    this.props.location.pathname !=
                        "/create-account/password" ? (
                        <Link
                            to={"/create-account/password"}
                            className="header-wrap__create-acc-btn"
                        >
                            <Translate content="account.create_account" />
                        </Link>
                    ) : null}

                    {this.props.currentAccount ? (
                        <div className="header-wrap__user-block">
                            <ConnectIndicator />

                            <UserHeaderBlock
                                userContract={userContract}
                                account={this.props.account}
                                history={this.props.history}
                            />
                        </div>
                    ) : null}

                    {this.props.currentAccount ? (
                        <div className="header-wrap__auth-block">
                            <NewIcon
                                iconClass={"lock-unlock"}
                                iconWidth={21}
                                iconHeight={30}
                                iconName={
                                    this.props.locked
                                        ? "lock_btn"
                                        : "unlock_btn"
                                }
                                onClick={this._toggleLock.bind(this)}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default Header = connect(Header, {
    listenTo() {
        return [AccountStore, WalletUnlockStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                ),
                locked: WalletUnlockStore.getState().locked
            };
        }
    }
});
