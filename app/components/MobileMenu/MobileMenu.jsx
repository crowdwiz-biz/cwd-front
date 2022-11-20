import React from "react";
import {ChainStore} from "bitsharesjs";
import Footer from "./Footer";
import {menuData} from "../LeftMenu/components/LeftMenuData";
import LeftMenuItem from "../LeftMenu/components/LeftMenuItem";

class MobileMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDepositModalVisible: false,
            hasDepositModalBeenShown: false,
            isWithdrawModalVisible: false,
            hasWithdrawalModalBeenShown: false,
            synced: this._syncStatus(),
            finance: false,
            exchange: false,
            active: this.props.history,
            locked: this.props.locked,
            menuData: menuData
        };

        this._syncStatus = this._syncStatus.bind(this);
    }

    componentDidMount() {
        this.syncCheckInterval = setInterval(
            this._syncStatus.bind(this, true),
            5000
        );

        // When the modal is shown, we want a fixed body
        let mobileMenuContainer = document.getElementById(
            "mobileMenuContainer"
        );

        mobileMenuContainer.style.position = "fixed";
        document.body.style.position = "fixed";
    }

    componentWillUnmount() {
        document.body.style.position = "relative";
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

    UNSAFE_componentWillUnmount() {
        clearInterval(this.syncCheckInterval);
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
        let menuData = this.state.menuData;

        return (
            <div className="header__mobile-menu" id="mobileMenuContainer">
                <div className="leftmenu__container--mobile">
                    <ul className="leftmenu__ul--mobile">
                        {menuData.map(item =>
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
                                    isToggled={true}
                                    toggleOff={this.props.toggleMobileMenuOff}
                                    isMobile={true}
                                />
                            ) : null
                        )}
                    </ul>
                </div>

                <div className="leftmenu__footer-wrap">
                    <Footer
                        synced={this.state.synced}
                        history={this.props.history}
                        toggleFooter={true}
                        closeDropdown={this.props.closeDropdown}
                        appVersion={this.props.appVersion}
                    />
                </div>
            </div>
        );
    }
}

export default MobileMenu;
