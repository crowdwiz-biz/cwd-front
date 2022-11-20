import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";
import { connect } from "alt-react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletUnlockActions from "actions/WalletUnlockActions";

//STYLES
import "./scss/mobile-footer.scss";

class MobileFooter extends React.Component {
    constructor(props) {
        super(props);
    }

    _toggleLock(e) {
        e.preventDefault();
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.getUserContract(this.props.currentAccount);
                })
                .catch(() => { });
        } else {
            WalletUnlockActions.lock();
        }
    }

    _onNavigate(route, menuItemID, e) {
        e.preventDefault();
        this.props.closeMobileMenu();
        this.props.history.push(route);

        if (this.props.currentAccount) {
            var elems = document.getElementsByClassName(
                "mobile-footer__action-item"
            );
            for (var i = 0; i < elems.length; i++) {
                elems[i].classList.remove("mobile-footer__action-item--active");
            }
            var menuItemID = document
                .getElementById(menuItemID)
                .classList.add("mobile-footer__action-item--active");
        }
    }

    render() {
        let nonRegUser;

        if (!this.props.currentAccount) {
            nonRegUser = true;
        }

        return (
            <div className="mobile-footer">
                {nonRegUser ? (
                    <div
                        className="mobile-footer__reg-btn noselect"
                        id="footerRegBtn"
                        onClick={this._onNavigate.bind(
                            this,
                            "/create-account/password",
                            "footerRegBtn"
                        )}
                    >
                        <Translate content="main_page.header.register_btn" />
                    </div>
                ) : (
                    <div className="mobile-footer__inner">
                        <ul className="mobile-footer__nav-list">
                            {/* GAMEZONE */}
                            <li
                                className="mobile-footer__action-item"
                                id="footerGamezone"
                                onClick={this._onNavigate.bind(
                                    this,
                                    "/gamezone",
                                    "footerGamezone"
                                )}
                            >
                                <span className="mobile-footer__action-link">
                                    <NewIcon
                                        iconClass={"mobile-footer__btn-icon"}
                                        iconWidth={26}
                                        iconHeight={25}
                                        iconName={"left-menu_gamezone"}
                                    />

                                    <Translate
                                        className="mobile-footer__btn-name"
                                        content="mobile_footer.gamezone"
                                    />
                                </span>
                            </li>

                            {/* FINANCE */}
                            <li
                                className="mobile-footer__action-item"
                                id="footerFinance"
                                onClick={this._onNavigate.bind(
                                    this,
                                    "/finance-dashboard",
                                    "footerFinance"
                                )}
                            >
                                <span className="mobile-footer__action-link">
                                    <NewIcon
                                        iconClass={"mobile-footer__btn-icon"}
                                        iconWidth={26}
                                        iconHeight={25}
                                        iconName={"left-menu_finance"}
                                    />

                                    <Translate
                                        className="mobile-footer__btn-name"
                                        content="header.finance"
                                    />
                                </span>
                            </li>

                            {/* LOCK / UNLOCK */}
                            <li
                                className="mobile-footer__lock-btn-wrap"
                                onClick={this._toggleLock.bind(this)}
                            >
                                <span className="mobile-footer__lock-btn">
                                    <NewIcon
                                        iconWidth={18}
                                        iconHeight={25}
                                        iconName={
                                            this.props.locked
                                                ? "lock_btn"
                                                : "unlock_btn"
                                        }
                                    />

                                    <Translate
                                        className={
                                            this.props.locked
                                                ? "mobile-footer__lock-text mobile-footer__lock-text--locked"
                                                : "mobile-footer__lock-text"
                                        }
                                        content={
                                            this.props.locked
                                                ? "mobile_footer.locked"
                                                : "mobile_footer.unlocked"
                                        }
                                    />
                                </span>
                            </li>

                            {/* VESTING */}
                            <li
                                className="mobile-footer__action-item"
                                id="footerVesting"
                                onClick={this._onNavigate.bind(
                                    this,
                                    `/account/${this.props.currentAccount}/vesting`,
                                    "footerVesting"
                                )}
                            >
                                <span className="mobile-footer__action-link">
                                    <NewIcon
                                        iconClass={"mobile-footer__btn-icon"}
                                        iconWidth={22}
                                        iconHeight={25}
                                        iconName={"left-menu_vesting"}
                                    />

                                    <Translate
                                        className="mobile-footer__btn-name"
                                        content="header.my_status"
                                    />
                                </span>
                            </li>

                            {/* EXCHANGE */}
                            <li
                                className="mobile-footer__action-item"
                                id="footerExchange"
                                onClick={this._onNavigate.bind(
                                    this,
                                    "/markets-dashboard",
                                    "footerExchange"
                                )}
                            >
                                <span className="mobile-footer__action-link">
                                    <NewIcon
                                        iconClass={"mobile-footer__btn-icon"}
                                        iconWidth={24}
                                        iconHeight={25}
                                        iconName={"left-menu_exchange"}
                                    />

                                    <Translate
                                        className="mobile-footer__btn-name"
                                        content="header.exchange"
                                    />
                                </span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default MobileFooter = connect(MobileFooter, {
    listenTo() {
        return [AccountStore, WalletUnlockStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                locked: WalletUnlockStore.getState().locked
            };
        }
    }
});
