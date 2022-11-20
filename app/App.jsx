import React from "react";
import { ChainStore } from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import NotificationStore from "stores/NotificationStore";
import { withRouter } from "react-router-dom";
import SyncError from "./components/SyncError/SyncError";
import LoadingIndicator from "./components/LoadingIndicator";
// import BrowserNotifications from "./components/BrowserNotifications/BrowserNotificationsContainer";
import Header from "components/Header/Header";
import MobileHeader from "components/Header/MobileHeader";
import MobileFooter from "components/MobileFooter/MobileFooter";
import ReactTooltip from "react-tooltip";
import NotificationSystem from "react-notification-system";
import TransactionConfirm from "./components/Blockchain/TransactionConfirm";
import WalletUnlockModal from "./components/Wallet/WalletUnlockModal";
import Deprecate from "./Deprecate";
import Incognito from "./components/Incognito";
import { isIncognito } from "feature_detect";
import titleUtils from "common/titleUtils";
import { BodyClassName, Notification } from "crowdwiz-ui-modal";
import { DEFAULT_NOTIFICATION_DURATION } from "services/Notification";
import Loadable from "react-loadable";
// import Borrow from "./components/Showcases/Borrow";
import LeftMenu from "./components/LeftMenu/LeftMenu";
import { Route, Switch, Redirect } from "react-router-dom";
import Page404 from "./components/Page404/Page404";
import ls from "common/localStorage";

const Exchange = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "exchange" */ "./components/Exchange/ExchangeContainer"
        ),
    loading: LoadingIndicator
});

const BlocksContainer = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "explorer" */ "./components/Explorer/BlocksContainer"
        ),
    loading: LoadingIndicator
});

const Witnesses = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "witnesses" */ "./components/Explorer/Witnesses"
        ),
    loading: LoadingIndicator
});

const AccountPage = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "account" */ "./components/Account/AccountPage"
        ),
    loading: LoadingIndicator
});

const AppSettings = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "settings" */ "./components/Settings/AppSettings"
        ),
    loading: LoadingIndicator
});

const Asset = Loadable({
    loader: () =>
        import(/* webpackChunkName: "asset" */ "./components/Blockchain/Asset"),
    loading: LoadingIndicator
});

const BlockContainer = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "block" */ "./components/Blockchain/BlockContainer"
        ),
    loading: LoadingIndicator
});

const CreateWorker = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "create-worker" */ "./components/Account/CreateWorker"
        ),
    loading: LoadingIndicator
});

/* GameZone */

const GameZone = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "gamezone" */ "./components/GameZone/GameZone"
        ),
    loading: LoadingIndicator
});

const GameHeads = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "gamezoneHeads" */ "./components/GameZone/GameHeads"
        ),
    loading: LoadingIndicator
});

const GameScoop = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "GameScoop" */ "./components/GameZone/GameScoop"
        ),
    loading: LoadingIndicator
});

const GameScoopItem = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "GameScoopItem" */ "./components/GameZone/components/GameScoopItem"
        ),
    loading: LoadingIndicator
});

const GameMatrix = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "GameMatrix" */ "./components/GameZone/Matrix/GameMatrix"
        ),
    loading: LoadingIndicator
});

const GameMatrixDev = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "GameMatrixDev" */ "./components/GameZone/Matrix/GameMatrixDev"
        ),
    loading: LoadingIndicator
});

/* CrowdMarket */

// const CrowdMarket = Loadable({
//     loader: () =>
//         import(
//             /* webpackChunkName: "crowdmarket" */ "./components/CrowdMarket/CrowdMarket"
//         ),
//     loading: LoadingIndicator
// });

/*FinanceDashboard*/
const FinanceDashboard = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "FinanceDashboard" */ "./components/FinanceDashboard/FinanceDashboard"
        ),
    loading: LoadingIndicator
});

/*CrowdGateway Decentralized*/
const CrowdGateway = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "CrowdGatewayDEC" */ "./components/CrowdGateway/CrowdGateway"
        ),
    loading: LoadingIndicator
});

/*SingleTradeItem Decentralized*/
const SingleTradeItem = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "SingleTradeItem" */ "./components/CrowdGateway/components/SingleTradeItem"
        ),
    loading: LoadingIndicator
});

/*Investment*/
const Investment = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "Investment" */ "./components/Investment/Investment"
        ),
    loading: LoadingIndicator
});

/*DexIndex*/
const DexIndex = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "DexIndex" */ "./components/Exchange/DexIndex"
        ),
    loading: LoadingIndicator
});

/*Shopping CrowdShop*/
const CrowdShop = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "CrowdShop" */ "./components/CrowdShop/CrowdShop"
        ),
    loading: LoadingIndicator
});

/*CrowdPledge*/
const CrowdPledge = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "CrowdPledge" */ "./components/CrowdPledge/CrowdPledgeIndex"
        ),
    loading: LoadingIndicator
});

/*CrowdPledge*/
const SingleCrowdPledgeItem = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "SingleCrowdPledgeItem" */ "./components/CrowdPledge/components/SingleCrowdPledgeItem"
        ),
    loading: LoadingIndicator
});

/*ProofOfCrowd*/
const ProofOfCrowd = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "ProofOfCrowd" */ "./components/ProofOfCrowd/ProofOfCrowd"
        ),
    loading: LoadingIndicator
});

const MainPage = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "MainPage" */ "./components/MainPage/MainPage"
        ),
    loading: LoadingIndicator
});

const GreatRace = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "GreatRace" */ "./components/GreatRace/GRIndex"
        ),
    loading: LoadingIndicator
});

const UrlTeamOverview = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "UrlTeamOverview" */ "./components/GreatRace/gr-components/utility/UrlTeamOverview"
        ),
    loading: LoadingIndicator
});

const UserProfile = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "UserProfile" */ "./components/UserProfile/UserProfile"
        ),
    loading: LoadingIndicator
});

const ContractOverview = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "ContractOverview" */ "./components/CotractOverview/ContractOverview"
        ),
    loading: LoadingIndicator
});

const AddressBook = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "AddressBook" */ "./components/AddressBook/AddressBook"
        ),
    loading: LoadingIndicator
});

const AccountVoting = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "AccountVoting" */ "./components/Account/AccountVoting"
        ),
    loading: LoadingIndicator
});

import LoginSelector from "./components/LoginSelector";
import PriceAlertNotifications from "./components/PriceAlertNotifications";

class App extends React.Component {
    constructor() {
        super();

        let syncFail =
            ChainStore.subError &&
                ChainStore.subError.message ===
                "ChainStore sync error, please check your system clock"
                ? true
                : false;
        this.state = {
            loading: false,
            synced: this._syncStatus(),
            syncFail,
            incognito: false,
            incognitoWarningDismissed: false,
            height: window && window.innerHeight,
            appVersion: "",
            hstnm: window.location.hostname,
            isMenuVisible: false
        };

        this._rebuildTooltips = this._rebuildTooltips.bind(this);
        this._chainStoreSub = this._chainStoreSub.bind(this);
        this._syncStatus = this._syncStatus.bind(this);
        this._getWindowHeight = this._getWindowHeight.bind(this);

        Notification.config({
            duration: DEFAULT_NOTIFICATION_DURATION,
            top: 90
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._getWindowHeight);
        NotificationStore.unlisten(this._onNotificationChange);
        ChainStore.unsubscribe(this._chainStoreSub);
        clearInterval(this.syncCheckInterval);
    }

    /**
     * Returns the current blocktime, or exception if not yet available
     * @returns {Date}
     */
    getBlockTime() {
        let dynGlobalObject = ChainStore.getObject("2.1.0");
        if (dynGlobalObject) {
            let block_time = dynGlobalObject.get("time");
            if (!/Z$/.test(block_time)) {
                block_time += "Z";
            }
            return new Date(block_time);
        } else {
            throw new Error("Blocktime not available right now");
        }
    }

    /**
     * Returns the delta between the current time and the block time in seconds, or -1 if block time not available yet
     *
     * Note: Could be integrating properly with BlockchainStore to send out updates, but not necessary atp
     */
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

    _syncStatus(setState = false) {
        let synced = this.getBlockTimeDelta() < 5;
        if (setState && synced !== this.state.synced) {
            this.setState({ synced });
        }
        return synced;
    }

    _setListeners() {
        try {
            window.addEventListener("resize", this._getWindowHeight, {
                capture: false,
                passive: true
            });
            NotificationStore.listen(this._onNotificationChange.bind(this));
            ChainStore.subscribe(this._chainStoreSub);
            AccountStore.tryToSetCurrentAccount();
        } catch (e) {
            console.error("e:", e);
        }
    }

    componentDidMount() {
        this._setListeners();
        this.syncCheckInterval = setInterval(
            this._syncStatus.bind(this, true),
            5000
        );

        this._getAppVersion();
        this.props.history.listen(this._rebuildTooltips);
        this._rebuildTooltips();

        isIncognito(
            function (incognito) {
                this.setState({ incognito });
            }.bind(this)
        );
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.onRouteChanged();
        }
    }

    onRouteChanged() {
        document.title = titleUtils.GetTitleByPath(
            this.props.location.pathname
        );
    }

    _getAppVersion() {
        fetch(
            "https://api.github.com/repos/crowdwiz-biz/crowdwiz-core/releases/latest"
        )
            .then(response => response.json())
            .then(data => {
                this.setState({
                    appVersion: data.tag_name
                });
            });
    }

    _onIgnoreIncognitoWarning() {
        this.setState({ incognitoWarningDismissed: true });
    }

    _rebuildTooltips() {
        if (this.rebuildTimeout) return;
        ReactTooltip.hide();

        this.rebuildTimeout = setTimeout(() => {
            if (this.refs.tooltip) {
                this.refs.tooltip.globalRebuild();
            }
            this.rebuildTimeout = null;
        }, 1500);
    }

    _chainStoreSub() {
        let synced = this._syncStatus();
        if (synced !== this.state.synced) {
            this.setState({ synced });
        }
        if (
            ChainStore.subscribed !== this.state.synced ||
            ChainStore.subError
        ) {
            let syncFail =
                ChainStore.subError &&
                    ChainStore.subError.message ===
                    "ChainStore sync error, please check your system clock"
                    ? true
                    : false;
            this.setState({
                syncFail
            });
        }
    }

    /** Usage: NotificationActions.[success,error,warning,info] */
    _onNotificationChange() {
        let notification = NotificationStore.getState().notification;
        if (notification.autoDismiss === void 0) {
            notification.autoDismiss = 10;
        }
        if (this.refs.notificationSystem)
            this.refs.notificationSystem.addNotification(notification);
    }

    _getWindowHeight() {
        this.setState({ height: window && window.innerHeight });
    }

    // /** Non-static, used by passing notificationSystem via react Component refs */
    // _addNotification(params) {
    //     console.log("add notification:", this.refs, params);
    //     this.refs.notificationSystem.addNotification(params);
    // }

    closeMobileMenu() {
        this.setState({
            isMenuVisible: false
        });
    }
    toggleMenu() {
        let menuState = this.state.isMenuVisible;

        this.setState({
            isMenuVisible: !menuState
        });
    }

    render() {
        let ss = new ls("__graphene__");
        let apiUrl = ss.get("serviceApi");

        let {
            incognito,
            incognitoWarningDismissed,
            appVersion,
            isMenuVisible
        } = this.state;
        let { walletMode, theme, location, match, ...others } = this.props;
        let content = null;

        let depricatedAssets = ["ALTER", "SILVER", "CARBON", "INDEX.CWD", "MULTICS", "CROWD.BTC", "GUARD"];
        let tradeUrl = window.location.href;

        let isDepricated = false;

        depricatedAssets.forEach(element => {
            if (tradeUrl.indexOf(element) != -1) {
                isDepricated = true;
            }
        });

        this.props.location.pathname;

        if (this.state.syncFail) {
            content = <SyncError />;
        } else if (this.state.loading) {
            content = (
                <LoadingIndicator
                    loadingText={"connecting to APIs and starting app"}
                    loading={this.state.loading}
                />
            );
        } else if (__DEPRECATED__) {
            content = <Deprecate {...this.props} />;
        } else {
            let accountName =
                AccountStore.getState().currentAccount ||
                AccountStore.getState().passwordAccount;
            accountName =
                accountName && accountName !== "null"
                    ? accountName
                    : "committee-account";
            let isScam = false;

            if (accountName != "null" && accountName != "committee-account") {
                let account = ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
                );

                let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

                if (account && scamAccounts) {
                    isScam =
                        scamAccounts
                            .get("blacklisted_accounts")
                            .indexOf(account.get("id")) >= 0;
                }
            }

            let deviceWidth = window.innerWidth;

            content = (
                <div className="app-container__height">
                    {this.props.location.pathname == "/" ? (
                        <div id="indexContent">
                            <MainPage
                                history={this.props.history}
                                apiUrl={apiUrl}
                                {...others}
                            />
                        </div>
                    ) : !isScam ? (
                        <section className="app-container__wrap">
                            {deviceWidth > 768 ? (
                                <Header
                                    history={this.props.history}
                                    location={this.props.location}
                                    {...others}
                                />
                            ) : (
                                <MobileHeader
                                    history={this.props.history}
                                    location={this.props.location}
                                    {...others}
                                    appVersion={appVersion}
                                    isMenuVisible={isMenuVisible}
                                    toggleMobileMenu={this.toggleMenu.bind(
                                        this
                                    )}
                                />
                            )}

                            {isMenuVisible ? null : (
                                <div
                                    id="mainContainer"
                                    className="app-container__inner"
                                >
                                    {deviceWidth > 768 ? (
                                        <div className="app-container__sidebar-wrap">
                                            <div className="app-container__sidebar left-menu-container">
                                                <LeftMenu
                                                    history={this.props.history}
                                                    appVersion={appVersion}
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="app-container__content">
                                        <Switch>
                                            <Route
                                                path="/create-account"
                                                component={LoginSelector}
                                            />
                                            <Route
                                                path="/account/:account_name"
                                                component={AccountPage}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/markets-dashboard"
                                                component={DexIndex}
                                                history={this.props.history}
                                            />
                                            {isDepricated ? null : (
                                                <Route
                                                    path="/market/:marketID"
                                                    component={Exchange}
                                                />
                                            )}
                                            <Route
                                                path="/settings"
                                                component={AppSettings}
                                            />
                                            <Route
                                                path={`/account/${accountName}/voting`}
                                                component={AccountVoting}
                                            />
                                            <Route
                                                exact
                                                path="/explorer"
                                                component={BlocksContainer}
                                            />
                                            <Route
                                                exact
                                                path="/block/:height"
                                                component={BlockContainer}
                                            />
                                            <Route
                                                exact
                                                path="/hash/:height"
                                                component={BlockContainer}
                                            />
                                            <Route
                                                path="/witnesses"
                                                component={Witnesses}
                                            />
                                            <Route
                                                path="/asset/:symbol"
                                                component={Asset}
                                            />
                                            {/* TODO SmartCoins */}
                                            {/* <Route
                                                path="/borrow"
                                                component={Borrow}
                                            /> */}
                                            <Route
                                                path="/create-worker"
                                                component={CreateWorker}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone"
                                                component={GameZone}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone/heads-or-tails"
                                                component={GameHeads}
                                                history={this.props.history}
                                                synced={this.state.synced}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone/scoop"
                                                component={GameScoop}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone/scoop/:scoopId"
                                                history={this.props.history}
                                                component={GameScoopItem}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone/matrix-game"
                                                component={GameMatrix}
                                            />
                                            <Route
                                                exact
                                                path="/gamezone/matrix-game-dev/:account_name"
                                                component={GameMatrixDev}
                                            />
                                            {/* <Route
                                                exact
                                                path="/crowdmarket"
                                                component={CrowdMarket}
                                            /> */}
                                            <Route
                                                exact
                                                path="/finance-dashboard"
                                                component={FinanceDashboard}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/gateway/dex"
                                                component={CrowdGateway}
                                            />
                                            <Route
                                                exact
                                                path="/gateway/dex/:dexItemId"
                                                history={this.props.history}
                                                component={SingleTradeItem}
                                            />
                                            <Route
                                                exact
                                                path="/:account_name/poc_staking"
                                                component={Investment}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/shopping/payment"
                                                component={CrowdShop}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/pledge-offer"
                                                component={CrowdPledge}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/pledge-offer/:pledgeItemId"
                                                history={this.props.history}
                                                component={SingleCrowdPledgeItem}
                                            />
                                            <Route
                                                exact
                                                path="/proof-of-crowd"
                                                component={ProofOfCrowd}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/great-race"
                                                component={GreatRace}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/great-race/:teamId"
                                                component={UrlTeamOverview}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/profile/:account_name"
                                                component={UserProfile}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/contracts-overview"
                                                component={ContractOverview}
                                                history={this.props.history}
                                            />
                                            <Route
                                                exact
                                                path="/address-book"
                                                component={AddressBook}
                                                history={this.props.history}
                                            />
                                            <Route
                                                path="*"
                                                component={Page404}
                                            />
                                        </Switch>
                                    </div>
                                </div>
                            )}

                            {deviceWidth <= 768 &&
                                this.props.location.pathname !=
                                "/create-account/password" ? (
                                <MobileFooter
                                    history={this.props.history}
                                    closeMobileMenu={this.closeMobileMenu.bind(
                                        this
                                    )}
                                    accountName={accountName}
                                />
                            ) : null}
                        </section>
                    ) : (
                        <div className="app-container__content">
                            <Page404 />
                        </div>
                    )}
                    <ReactTooltip
                        ref="tooltip"
                        place="top"
                        type={theme === "lightTheme" ? "dark" : "light"}
                        effect="solid"
                    />
                </div>
            );
        }

        let deviceWidth = window.innerWidth;
        let notificationWidth;

        if (deviceWidth > 375) {
            notificationWidth = "375px";
        } else {
            notificationWidth = "340px";
        }

        return (
            <div
                style={{ backgroundColor: !theme ? "#262626" : null }}
                className={theme + " app-container__height"}
            >
                <BodyClassName className={theme + " app-container__height"}>
                    {walletMode && incognito && !incognitoWarningDismissed ? (
                        <Incognito
                            onClickIgnore={this._onIgnoreIncognitoWarning.bind(
                                this
                            )}
                        />
                    ) : null}
                    <div id="content-wrapper" className="app-container">
                        {content}
                        <NotificationSystem
                            ref="notificationSystem"
                            allowHTML={true}
                            style={{
                                Containers: {
                                    DefaultStyle: {
                                        width: notificationWidth
                                    }
                                }
                            }}
                        />
                        <TransactionConfirm />
                        {/* <BrowserNotifications /> */}
                        <PriceAlertNotifications />
                        <WalletUnlockModal />
                    </div>
                </BodyClassName>
            </div>
        );
    }
}

export default withRouter(App);
