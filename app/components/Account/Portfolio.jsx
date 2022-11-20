import React from "react";
import Immutable from "immutable";
import Translate from "react-translate-component";
import TotalBalanceValue from "../Utility/TotalBalanceValue";
import Proposals from "components/Account/Proposals";
import { ChainStore } from "bitsharesjs";
import SettingsActions from "actions/SettingsActions";
import utils from "common/utils";
import { Tabs, Tab } from "../Utility/Tabs";
import AccountOrders from "../Account/AccountOrders";
import TranslateWithLinks from "../Utility/TranslateWithLinks";
import { checkMarginStatus } from "common/accountHelper";
import BalanceWrapper from "../Account/BalanceWrapper";
import AccountTreemap from "../Account/AccountTreemap";
import AssetWrapper from "../Utility/AssetWrapper";
import AccountPortfolioList from "../Account/AccountPortfolioList";
import Switch from "react-switch";
import NewIcon from "../NewIcon/NewIcon";
import counterpart from "counterpart";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";

require("./scss/portfolio.scss");

let accountStorage = new ls("__graphene__");

class Portfolio extends React.Component {
    constructor(props) {
        super();
        this.state = {
            sortKey: props.viewSettings.get("portfolioSort", "totalValue"),
            sortDirection: props.viewSettings.get(
                "portfolioSortDirection",
                true
            ), // alphabetical A -> B, numbers high to low
            shownAssets: props.viewSettings.get("shownAssets", "active"),
            alwaysShowAssets: ["CWD", "GCWD", "CROWD.BTC"],
            hideFishingProposals: true,
            currentAccount: accountStorage.get("passwordAccount")
        };

        this._handleFilterInput = this._handleFilterInput.bind(this);
    }

    _handleFilterInput(e) {
        e.preventDefault();
        this.setState({
            filterValue: e.target.value
        });
    }

    UNSAFE_componentWillMount() {
        this._checkMarginStatus();
    }

    _checkMarginStatus(props = this.props) {
        checkMarginStatus(props.account).then(status => {
            let globalMarginStatus = null;
            for (let asset in status) {
                globalMarginStatus =
                    status[asset].statusClass || globalMarginStatus;
            }
            this.setState({ globalMarginStatus });
        });
    }

    UNSAFE_componentWillReceiveProps(np) {
        if (np.account !== this.props.account) {
            this._checkMarginStatus(np);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextProps.balances, this.props.balances) ||
            nextProps.account !== this.props.account ||
            nextProps.isMyAccount !== this.props.isMyAccount ||
            nextProps.settings !== this.props.settings ||
            nextProps.hiddenAssets !== this.props.hiddenAssets ||
            !utils.are_equal_shallow(nextState, this.state) ||
            this.state.filterValue !== nextState.filterValue
        );
    }

    _changeShownAssets(shownAssets = "active") {
        this.setState({
            shownAssets
        });
        SettingsActions.changeViewSetting({
            shownAssets
        });
    }

    _toggleSortOrder(key) {
        if (this.state.sortKey === key) {
            SettingsActions.changeViewSetting({
                portfolioSortDirection: !this.state.sortDirection
            });
            this.setState({
                sortDirection: !this.state.sortDirection
            });
        } else {
            SettingsActions.changeViewSetting({
                portfolioSort: key
            });
            this.setState({
                sortDirection: false,
                sortKey: key
            });
        }
    }
    _toggleHideProposal() {
        this.setState({
            hideFishingProposals: !this.state.hideFishingProposals
        });
    }

    getHeader() {
        return <div className="portfolio__header" />;
    }

    render() {
        let { account, hiddenAssets, settings, orders } = this.props;
        let { shownAssets } = this.state;

        if (!account) {
            return null;
        }

        const preferredUnit =
            settings.get("unit") || this.props.core_asset.get("symbol");

        let call_orders = [],
            collateral = {},
            debt = {};

        if (account.toJS && account.has("call_orders"))
            call_orders = account.get("call_orders").toJS();
        let includedPortfolioList, hiddenPortfolioList;
        let account_balances = account.get("balances");
        let includedBalancesList = Immutable.List(),
            hiddenBalancesList = Immutable.List();
        call_orders.forEach(callID => {
            let position = ChainStore.getObject(callID);
            if (position) {
                let collateralAsset = position.getIn([
                    "call_price",
                    "base",
                    "asset_id"
                ]);
                if (!collateral[collateralAsset]) {
                    collateral[collateralAsset] = parseInt(
                        position.get("collateral"),
                        10
                    );
                } else {
                    collateral[collateralAsset] += parseInt(
                        position.get("collateral"),
                        10
                    );
                }
                let debtAsset = position.getIn([
                    "call_price",
                    "quote",
                    "asset_id"
                ]);
                if (!debt[debtAsset]) {
                    debt[debtAsset] = parseInt(position.get("debt"), 10);
                } else {
                    debt[debtAsset] += parseInt(position.get("debt"), 10);
                }
            }
        });

        if (account_balances) {
            // Filter out balance objects that have 0 balance or are not included in open orders
            account_balances = account_balances.filter((a, index) => {
                let balanceObject = ChainStore.getObject(a);
                if (
                    balanceObject &&
                    !balanceObject.get("balance") &&
                    !orders[index]
                ) {
                    return false;
                } else {
                    return true;
                }
            });

            // Separate balances into hidden and included
            account_balances.forEach((a, asset_type) => {
                const asset = ChainStore.getAsset(asset_type);

                let assetName = "";
                let filter = "";

                if (this.state.filterValue) {
                    filter = this.state.filterValue
                        ? String(this.state.filterValue).toLowerCase()
                        : "";
                    assetName = asset.get("symbol").toLowerCase();
                    let { isBitAsset } = utils.replaceName(asset);
                    if (isBitAsset) {
                        assetName = "bit" + assetName;
                    }
                }

                if (
                    hiddenAssets.includes(asset_type) &&
                    assetName.includes(filter)
                ) {
                    hiddenBalancesList = hiddenBalancesList.push(a);
                } else if (assetName.includes(filter)) {
                    includedBalancesList = includedBalancesList.push(a);
                }
            });
        }

        let portfolioHiddenAssetsBalance = (
            <TotalBalanceValue noTip balances={hiddenBalancesList} hide_asset />
        );

        let portfolioActiveAssetsBalance = (
            <TotalBalanceValue
                noTip
                balances={includedBalancesList}
                hide_asset
            />
        );
        let ordersValue = (
            <TotalBalanceValue
                noTip
                balances={Immutable.List()}
                openOrders={orders}
                hide_asset
            />
        );
        let marginValue = (
            <TotalBalanceValue
                noTip
                balances={Immutable.List()}
                debt={debt}
                collateral={collateral}
                hide_asset
            />
        );
        let debtValue = (
            <TotalBalanceValue
                noTip
                balances={Immutable.List()}
                debt={debt}
                hide_asset
            />
        );
        let collateralValue = (
            <TotalBalanceValue
                noTip
                balances={Immutable.List()}
                collateral={collateral}
                hide_asset
            />
        );

        const totalValueText = (
            <TranslateWithLinks
                noLink
                string="account.total"
                keys={[{ type: "asset", value: preferredUnit, arg: "asset" }]}
            />
        );

        const includedPortfolioBalance = (
            <div key="portfolio" className="total-value portfolio__total-value">
                <div>{totalValueText}</div>
                <div className="column-hide-small" />
                <div className="column-hide-small" />
                <div>{portfolioActiveAssetsBalance}</div>
                {/* <div colSpan="9" /> */}
            </div>
        );

        const hiddenPortfolioBalance = (
            <tr key="portfolio" className="total-value portfolio__total-value">
                <td colSpan="2" style={{ textAlign: "left" }}>
                    {totalValueText}
                </td>
                <td className="column-hide-small" />
                <td className="column-hide-small" />
                <td style={{ textAlign: "right" }}>
                    {portfolioHiddenAssetsBalance}
                </td>
                <td colSpan="9" />
            </tr>
        );

        includedPortfolioList = (
            <AccountPortfolioList
                balanceList={includedBalancesList}
                optionalAssets={
                    !this.state.filterValue ? this.state.alwaysShowAssets : null
                }
                visible={true}
                preferredUnit={preferredUnit}
                coreAsset={this.props.core_asset}
                coreSymbol={this.props.core_asset.get("symbol")}
                hiddenAssets={hiddenAssets}
                orders={orders}
                account={this.props.account}
                sortKey={this.state.sortKey}
                sortDirection={this.state.sortDirection}
                isMyAccount={this.props.isMyAccount}
                balances={this.props.balances}
                header={this.getHeader()}
                extraRow={includedPortfolioBalance}
                history={this.props.history}
            />
        );

        hiddenPortfolioList = (
            <AccountPortfolioList
                balanceList={hiddenBalancesList}
                optionalAssets={
                    !this.state.filterValue ? this.state.alwaysShowAsset : null
                }
                visible={false}
                preferredUnit={preferredUnit}
                coreSymbol={this.props.core_asset.get("symbol")}
                settings={settings}
                hiddenAssets={hiddenAssets}
                orders={orders}
                account={this.props.account}
                sortKey={this.state.sortKey}
                sortDirection={this.state.sortDirection}
                isMyAccount={this.props.isMyAccount}
                balances={this.props.balances}
                header={this.getHeader()}
                extraRow={hiddenPortfolioBalance}
            />
        );

        // add unicode non-breaking space as subtext to Activity Tab to ensure that all titles are aligned
        // horizontally

        let account_name = this.props.account_name;
        let passAccount = AccountStore.getState().passwordAccount;

        return (
            <div className="tabs-container">

                <span className="cwd-common__title cwd-common__title--lower-case">{account_name}</span>

                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab title="account.portfolio">
                        <div className="header-selector">
                            <input
                                className="cwd-common__filter"
                                type="text"
                                placeholder={counterpart.translate(
                                    "assets.portfolio.find_asset"
                                )}
                                onChange={this._handleFilterInput}
                            />
                        </div>

                        {shownAssets != "visual" ? (
                            shownAssets === "hidden" &&
                                hiddenBalancesList.size ? (
                                hiddenPortfolioList
                            ) : (
                                includedPortfolioList
                            )
                        ) : (
                            <AccountTreemap
                                balanceObjects={includedBalancesList}
                            />
                        )}
                    </Tab>

                    <Tab
                        title="account.open_orders"
                        subText={ordersValue}
                    >
                        <AccountOrders {...this.props}>
                            <div className="account-orders__total">
                                <span className="account-orders__total-text">
                                    {totalValueText}
                                </span>
                                <span className="account-orders__total-amount">
                                    {ordersValue}
                                </span>
                                {this.props.isMyAccount ? (
                                    <span />
                                ) : null}
                            </div>
                        </AccountOrders>
                    </Tab>

                    {account.get("proposals") &&
                        account.get("proposals").size ? (
                        <Tab
                            title="explorer.proposals.title"
                            subText={String(
                                account.get("proposals")
                                    ? account.get("proposals").size
                                    : 0
                            )}
                        >
                            <div
                                onClick={this._toggleHideProposal.bind(this)}
                                className="proposals-switch__wrap"
                            >
                                <Switch
                                    className="proposals-switch__btn"
                                    onChange={this.handleChange}
                                    checked={this.state.hideFishingProposals}
                                    offColor={"#6d6d6d"}
                                    onColor={"#141414"}
                                    onHandleColor={"#DEC27F"}
                                    checkedIcon={false}
                                    uncheckedIcon={false}
                                    height={20}
                                    width={36}
                                    borderRadius={20}
                                    checkedHandleIcon={
                                        <NewIcon
                                            iconWidth={12}
                                            iconHeight={8}
                                            iconName={"checkmark"}
                                        />
                                    }
                                    onChange={this._toggleHideProposal.bind(this)}
                                />

                                <Translate
                                    className="proposals-switch__text"
                                    content="account.deactivate_suspicious_proposals" />
                            </div>

                            <Proposals
                                className="dashboard-table"
                                account={account}
                                hideFishingProposals={
                                    this.state.hideFishingProposals
                                }
                            />
                        </Tab>
                    ) : null}
                </Tabs>
            </div>
        );
    }
}

Portfolio = AssetWrapper(Portfolio, { propNames: ["core_asset"] });

export default class PortfolioWrapper extends React.Component {
    render() {
        return <BalanceWrapper {...this.props} wrap={Portfolio} />;
    }
}
