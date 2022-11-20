import React from "react";
import debounceRender from "react-debounce-render";
import BalanceComponent from "../Utility/BalanceComponent";
import {BalanceValueComponent} from "../Utility/EquivalentValueComponent";
import {Market24HourChangeComponent} from "../Utility/MarketChangeComponent";
import assetUtils from "common/asset_utils";
import counterpart from "counterpart";
import {Link} from "react-router-dom";
import EquivalentPrice from "../Utility/EquivalentPrice";
import LinkToAssetById from "../Utility/LinkToAssetById";
import BorrowModal from "../Modal/BorrowModal";
import ReactTooltip from "react-tooltip";
import {ChainStore} from "bitsharesjs";
import WalletUnlockStore from "stores/WalletUnlockStore";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import MarketsStore from "stores/MarketsStore";
import NewIcon from "../NewIcon/NewIcon";
import utils from "common/utils";
import Transfer from "../Modal/Transfer";
import SettingsActions from "actions/SettingsActions";
import SettleModal from "../Modal/SettleModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import ReserveAssetModal from "../Modal/ReserveAssetModal";
import PaginatedList from "../Utility/PaginatedList";
import MarketUtils from "common/market_utils";
import {Tooltip} from "crowdwiz-ui-modal";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";

class AccountPortfolioList extends React.Component {
    constructor() {
        super();

        this.state = {
            isSettleModalVisible: false,
            isBorrowModalVisible: false,
            isBurnModalVisible: false,
            isSettleModalVisibleBefore: false,
            isBorrowModalVisibleBefore: false,
            isBurnModalVisibleBefore: false,
            borrow: null,
            settleAsset: "1.3.0",
            allRefsAssigned: false,
            selectedAsset: null
        };

        this.qtyRefs = {};
        this.priceRefs = {};
        this.valueRefs = {};
        this.changeRefs = {};
        for (let key in this.sortFunctions) {
            this.sortFunctions[key] = this.sortFunctions[key].bind(this);
        }
        this._checkRefAssignments = this._checkRefAssignments.bind(this);

        this.showSettleModal = this.showSettleModal.bind(this);
        this.hideSettleModal = this.hideSettleModal.bind(this);

        this.showBorrowModal = this.showBorrowModal.bind(this);
        this.hideBorrowModal = this.hideBorrowModal.bind(this);

        this.showBurnModal = this.showBurnModal.bind(this);
        this.hideBurnModal = this.hideBurnModal.bind(this);
    }

    UNSAFE_componentWillMount() {
        this.refCheckInterval = setInterval(this._checkRefAssignments);
    }

    componentWillUnmount() {
        clearInterval(this.refCheckInterval);
    }

    _checkRefAssignments() {
        /*
         * In order for sorting to work all refs must be assigned, so we check
         * this here and update the state to trigger a rerender
         */
        if (!this.state.allRefsAssigned) {
            let refKeys = ["qtyRefs", "priceRefs", "valueRefs", "changeRefs"];
            const allRefsAssigned = refKeys.reduce((a, b) => {
                if (a === undefined) return !!Object.keys(this[b]).length;
                return !!Object.keys(this[b]).length && a;
            }, undefined);
            if (allRefsAssigned) {
                clearInterval(this.refCheckInterval);
                this.setState({allRefsAssigned});
            }
        }
    }

    shouldComponentUpdate(np, ns) {
        return (
            !utils.are_equal_shallow(ns, this.state) ||
            !utils.are_equal_shallow(np.backedCoins, this.props.backedCoins) ||
            !utils.are_equal_shallow(np.balances, this.props.balances) ||
            !utils.are_equal_shallow(np.balanceList, this.props.balanceList) ||
            !utils.are_equal_shallow(
                np.optionalAssets,
                this.props.optionalAssets
            ) ||
            np.account !== this.props.account ||
            np.visible !== this.props.visible ||
            np.settings !== this.props.settings ||
            np.hiddenAssets !== this.props.hiddenAssets ||
            np.sortDirection !== this.props.sortDirection ||
            np.sortKey !== this.props.sortKey ||
            np.locked !== this.props.locked ||
            np.isMyAccount !== this.props.isMyAccount ||
            np.allMarketStats.reduce((a, value, key) => {
                return (
                    utils.check_market_stats(
                        value,
                        this.props.allMarketStats.get(key)
                    ) || a
                );
            }, false)
        );
    }

    toggleAssetOperations(assetId) {
        let isScam = false;
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        if (this.props.account && scamAccounts) {
            isScam =
                scamAccounts
                    .get("blacklisted_accounts")
                    .indexOf(this.props.account.get("id")) >= 0;

            if (!isScam) {
                if (this.state.selectedAsset === assetId) {
                    this.setState({selectedAsset: null});
                } else {
                    this.setState({selectedAsset: assetId});
                }
            }
        }
    }

    showBurnModal() {
        this.setState({
            isBurnModalVisible: true,
            isBurnModalVisibleBefore: true
        });
    }

    hideBurnModal() {
        this.setState({
            isBurnModalVisible: false
        });
    }

    showSettleModal() {
        this.setState({
            isSettleModalVisible: true,
            isSettleModalVisibleBefore: true
        });
    }

    hideSettleModal() {
        this.setState({
            isSettleModalVisible: false
        });
    }

    showBorrowModal(quoteAsset, backingAsset, account) {
        this.setState({
            isBorrowModalVisible: true,
            isBorrowModalVisibleBefore: true,
            borrow: {
                quoteAsset: quoteAsset,
                backingAsset: backingAsset,
                account: account
            }
        });
    }

    hideBorrowModal() {
        this.setState({
            borrow: null,
            isBorrowModalVisible: false
        });
    }

    sortFunctions = {
        qty: function(a, b, force) {
            if (Number(this.qtyRefs[a.key]) < Number(this.qtyRefs[b.key]))
                return this.props.sortDirection || force ? -1 : 1;

            if (Number(this.qtyRefs[a.key]) > Number(this.qtyRefs[b.key]))
                return this.props.sortDirection || force ? 1 : -1;
        },
        alphabetic: function(a, b, force) {
            if (a.key > b.key)
                return this.props.sortDirection || force ? 1 : -1;
            if (a.key < b.key)
                return this.props.sortDirection || force ? -1 : 1;
            return 0;
        },
        priceValue: function(a, b) {
            let aPrice = this.priceRefs[a.key];
            let bPrice = this.priceRefs[b.key];
            if (aPrice && bPrice) {
                return this.props.sortDirection
                    ? aPrice - bPrice
                    : bPrice - aPrice;
            } else if (aPrice === null && bPrice !== null) {
                return 1;
            } else if (aPrice !== null && bPrice === null) {
                return -1;
            } else {
                return this.sortFunctions.alphabetic(a, b, true);
            }
        },
        totalValue: function(a, b) {
            let aValue = this.valueRefs[a.key];
            let bValue = this.valueRefs[b.key];
            if (aValue && bValue) {
                return this.props.sortDirection
                    ? aValue - bValue
                    : bValue - aValue;
            } else if (!aValue && bValue) {
                return 1;
            } else if (aValue && !bValue) {
                return -1;
            } else {
                return this.sortFunctions.alphabetic(a, b, true);
            }
        },
        changeValue: function(a, b) {
            let aValue = this.changeRefs[a.key];
            let bValue = this.changeRefs[b.key];

            if (aValue && bValue) {
                let aChange =
                    parseFloat(aValue) != "NaN" ? parseFloat(aValue) : aValue;
                let bChange =
                    parseFloat(bValue) != "NaN" ? parseFloat(bValue) : bValue;
                let direction =
                    typeof this.props.sortDirection !== "undefined"
                        ? this.props.sortDirection
                        : true;

                return direction ? aChange - bChange : bChange - aChange;
            }
        }
    };

    _toggleLock(e) {
        e.preventDefault();
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                })
                .catch(() => {});
        } else {
            WalletUnlockActions.lock();
            if (!WalletUnlockStore.getState().rememberMe) {
                if (!isPersistantType()) {
                    setLocalStorageType("persistant");
                }
                AccountActions.setPasswordAccount(null);
                AccountStore.tryToSetCurrentAccount();
            }
        }
    }

    triggerSend(asset) {
        this.setState({send_asset: asset}, () => {
            if (this.send_modal) this.send_modal.show();
        });
    }

    _onSettleAsset(id, e) {
        e.preventDefault();
        this.setState({
            settleAsset: id
        });

        this.showSettleModal();
    }

    _hideAsset(asset, status) {
        SettingsActions.hideAsset(asset, status);
    }

    _burnAsset(asset, e) {
        e.preventDefault();
        this.setState({reserve: asset});
        this.showBurnModal();
    }

    _getSeparator(render) {
        return render ? <span>&nbsp;|&nbsp;</span> : null;
    }

    _onNavigate(route, e) {
        e.preventDefault();
        this.props.history.push(route);
    }

    _renderGatewayAction = (type, allowed, assetName, emptyCell) => {
        let actionTitle =
            type == "deposit"
                ? counterpart.translate("gateway.deposit")
                : `icons.${type}`;

        let text =
            type == "deposit"
                ? counterpart.translate("gateway.deposit")
                : counterpart.translate("gateway.withdraw");

        let linkElement = (
            <span
                onClick={
                    this.props.isMyAccount
                        ? this._onNavigate.bind(this, "/finance-dashboard")
                        : null
                }
                className="portfolio__link"
            >
                <NewIcon iconWidth={16} iconHeight={16} iconName={"deposit"} />
                <span>{actionTitle}</span>
            </span>
        );

        if (allowed && this.props.isMyAccount) {
            return linkElement;
        } else if (allowed && !this.props.isMyAccount) {
            return (
                <Tooltip
                    title={counterpart.translate("tooltip.login_required")}
                >
                    {linkElement}
                </Tooltip>
            );
        } else {
            return (
                <span className="portfolio__link portfolio__link--inactive">
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"deposit"}
                    />
                    <span>{text}</span>
                </span>
            );
        }
    };

    _renderBalances(balanceList, optionalAssets, visible) {
        const {coreSymbol, preferredUnit, hiddenAssets, orders} = this.props;

        const renderBorrow = (asset, account) => {
            let isBitAsset = asset && asset.has("bitasset_data_id");
            let isGlobalSettled =
                isBitAsset && asset.getIn(["bitasset", "settlement_fund"]) > 0
                    ? true
                    : false;

            return {
                isBitAsset,
                borrowLink:
                    !isBitAsset || isGlobalSettled ? null : (
                        <a
                            onClick={() => {
                                ReactTooltip.hide();
                                this.showBorrowModal(
                                    asset.get("id"),
                                    asset.getIn([
                                        "bitasset",
                                        "options",
                                        "short_backing_asset"
                                    ]),
                                    account
                                );
                            }}
                        >
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"dollar"}
                            />
                        </a>
                    )
            };
        };

        let balances = [];
        const emptyCell = "-";
        balanceList.forEach(balance => {
            let balanceObject = ChainStore.getObject(balance);
            if (!balanceObject) return;
            let asset_type = balanceObject.get("asset_type");
            let asset = ChainStore.getObject(asset_type);
            if (!asset) return;

            let directMarketLink, settleLink, transferLink;
            let symbol = "";

            const assetName = asset.get("symbol");
            const notCore = asset.get("id") !== "1.3.0";
            const notCorePrefUnit = preferredUnit !== coreSymbol;

            let {market} = assetUtils.parseDescription(
                asset.getIn(["options", "description"])
            );
            symbol = asset.get("symbol");
            if (symbol.indexOf("OPEN.") !== -1 && !market) market = "CWD";
            let preferredMarket = market ? market : preferredUnit;

            if (notCore && preferredMarket === symbol)
                preferredMarket = coreSymbol;

            /* Table content */
            directMarketLink = notCore ? (
                <Link
                    className="portfolio__link"
                    to={`/market/${asset.get("symbol")}_${preferredMarket}`}
                >
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"trade"}
                    />
                    <Translate component="span" content="account.trade" />
                </Link>
            ) : notCorePrefUnit ? (
                <Link
                    className="portfolio__link"
                    to={`/market/${asset.get("symbol")}_${preferredUnit}`}
                >
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"trade"}
                    />
                </Link>
            ) : (
                <span className="portfolio__link portfolio__link--inactive">
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"trade"}
                    />
                    <Translate component="span" content="account.trade" />
                </span>
            );

            transferLink = (
                <a
                    className="portfolio__link"
                    onClick={this.triggerSend.bind(this, asset.get("id"))}
                >
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"transfer"}
                    />
                    <Translate component="span" content="transfer.send" />
                </a>
            );

            let {isBitAsset, borrowLink} = renderBorrow(
                asset,
                this.props.account
            );

            /* Popover content */
            settleLink = (
                <a onClick={this._onSettleAsset.bind(this, asset.get("id"))}>
                    <NewIcon
                        iconWidth={16}
                        iconHeight={16}
                        iconName={"settle"}
                    />
                </a>
            );

            const hasBalance = !!balanceObject.get("balance");
            const hasOnOrder = !!orders[asset_type];

            const canDeposit = asset.get("symbol") == "CWD";

            const assetAmount = balanceObject.get("balance");

            /* Sorting refs */
            this.qtyRefs[asset.get("symbol")] = utils.get_asset_amount(
                assetAmount,
                asset
            );

            {
                /* Asset and Backing Asset Prefixes */
            }
            let options =
                asset && asset.getIn(["bitasset", "options"])
                    ? asset.getIn(["bitasset", "options"]).toJS()
                    : null;
            let backingAsset =
                options && options.short_backing_asset
                    ? ChainStore.getAsset(options.short_backing_asset)
                    : null;
            let {isBitAsset: isAssetBitAsset} = utils.replaceName(asset);
            let {isBitAsset: isBackingBitAsset} = utils.replaceName(
                backingAsset
            );
            let settlePriceTitle;
            if (
                isBitAsset &&
                asset.get("bitasset").get("settlement_fund") > 0
            ) {
                settlePriceTitle = "tooltip.global_settle";
            } else {
                settlePriceTitle = "tooltip.settle";
            }

            let preferredAsset = ChainStore.getAsset(preferredUnit);
            this.valueRefs[asset.get("symbol")] =
                hasBalance && !!preferredAsset
                    ? MarketUtils.convertValue(
                          assetAmount,
                          preferredAsset,
                          asset,
                          this.props.allMarketStats,
                          this.props.coreAsset,
                          true
                      )
                    : null;

            this.priceRefs[asset.get("symbol")] = !preferredAsset
                ? null
                : MarketUtils.getFinalPrice(
                      this.props.coreAsset,
                      asset,
                      preferredAsset,
                      this.props.allMarketStats,
                      true
                  );

            let marketId = asset.get("symbol") + "_" + preferredUnit;
            let currentMarketStats = this.props.allMarketStats.get(marketId);
            this.changeRefs[asset.get("symbol")] =
                currentMarketStats && currentMarketStats.change
                    ? currentMarketStats.change
                    : 0;

            balances.push(
                <div key={asset.get("symbol")} className="portfolio__row">
                    <div className="portfolio__inner">
                        <div className="portfolio__asset-type">
                            <div className="portfolio__asset-type-header">
                                <Translate
                                    content="assets.portfolio.active"
                                    component="span"
                                />
                            </div>
                            <span className="portfolio__asset">
                                <LinkToAssetById asset={asset.get("id")} />
                            </span>
                        </div>
                        <div className="portfolio__balance">
                            {hasBalance || hasOnOrder ? (
                                <div className="portfolio__balance-inner">
                                    <div className="portfolio__balance-header">
                                        <Translate
                                            content="assets.portfolio.quantity"
                                            component="span"
                                        />
                                    </div>
                                    <BalanceComponent
                                        className="portfolio__balance-item"
                                        balance={balance}
                                        hide_asset
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className="portfolio__price">
                            <div className="portfolio__price-header">
                                <Translate
                                    content="assets.portfolio.price"
                                    component="span"
                                />
                            </div>
                            <EquivalentPrice
                                fromAsset={asset.get("id")}
                                pulsate={{reverse: true, fill: "forwards"}}
                                hide_symbols
                            />
                        </div>
                        <div className="portfolio__hours">
                            <div className="portfolio__hours-header">
                                24
                                <Translate
                                    content="assets.portfolio.hours"
                                    component="span"
                                />
                            </div>
                            <Market24HourChangeComponent
                                base={asset.get("id")}
                                quote={preferredUnit}
                                marketId={marketId}
                                hide_symbols
                            />
                        </div>
                        <div className="portfolio__cost">
                            {hasBalance || hasOnOrder ? (
                                <div className="portfolio__balance-inner">
                                    <div className="portfolio__cost-header">
                                        <Translate
                                            content="assets.portfolio.value"
                                            component="span"
                                        />
                                    </div>
                                    <BalanceValueComponent
                                        balance={balance}
                                        toAsset={preferredUnit}
                                        hide_asset
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {!this.props.locked ? (
                        <button
                            className="btn portfolio__btn"
                            onClick={() =>
                                this.toggleAssetOperations(asset.get("symbol"))
                            }
                        >
                            <Translate
                                content="assets.portfolio.operations-btn"
                                component="span"
                            />
                        </button>
                    ) : (
                        <button
                            className="btn portfolio__btn"
                            onClick={this._toggleLock.bind(this)}
                        >
                            <Translate
                                content="assets.portfolio.operations-btn"
                                component="span"
                            />
                        </button>
                    )}

                    {this.state.selectedAsset == asset.get("symbol") ? (
                        <div className="portfolio__operations-wrap">
                            <div className="portfolio__action-row portfolio__transfer">
                                {transferLink}
                            </div>

                            <div className="portfolio__action-row">
                                {this._renderGatewayAction(
                                    "deposit",
                                    canDeposit,
                                    assetName,
                                    emptyCell
                                )}
                            </div>

                            <div className="portfolio__action-row">
                                {directMarketLink}
                            </div>

                            <div className="portfolio__action-row">
                                {!isBitAsset ? (
                                    <a
                                        className="portfolio__link"
                                        style={{marginRight: 0}}
                                        onClick={this._burnAsset.bind(
                                            this,
                                            asset.get("id")
                                        )}
                                    >
                                        <NewIcon
                                            iconWidth={16}
                                            iconHeight={16}
                                            iconName={"fire"}
                                        />
                                        <Translate
                                            component="span"
                                            content="modal.reserve.donate"
                                        />
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>
            );
        });

        balances.sort(this.sortFunctions[this.props.sortKey]);
        return balances;
    }

    _renderTransfer() {
        return (
            <Transfer
                id="send_modal_portfolio"
                refCallback={e => {
                    if (e) this.send_modal = e;
                }}
                from_name={this.props.account.get("name")}
                asset_id={this.state.send_asset || "1.3.0"}
            />
        );
    }

    _renderBorrowModal() {
        if (
            !this.state.borrow ||
            !this.state.borrow.quoteAsset ||
            !this.state.borrow.backingAsset ||
            !this.state.borrow.account ||
            !this.state.isBorrowModalVisibleBefore
        ) {
            return null;
        }

        return (
            <BorrowModal
                visible={this.state.isBorrowModalVisible}
                showModal={this.showBorrowModal}
                hideModal={this.hideBorrowModal}
                account={this.state.borrow && this.state.borrow.account}
                quote_asset={this.state.borrow && this.state.borrow.quoteAsset}
                backing_asset={
                    this.state.borrow && this.state.borrow.backingAsset
                }
            />
        );
    }

    _renderSettleModal() {
        return (
            <SettleModal
                visible={this.state.isSettleModalVisible}
                hideModal={this.hideSettleModal}
                showModal={this.showSettleModal}
                asset={this.state.settleAsset}
                account={this.props.account.get("name")}
            />
        );
    }

    render() {
        return (
            <div className="portfolio">
                <PaginatedList
                    paginatedWrap="portfolio__wrap"
                    rows={this._renderBalances(
                        this.props.balanceList,
                        this.props.optionalAssets,
                        this.props.visible
                    )}
                    pageSize={20}
                    label="utility.total_x_assets"
                    extraRow={this.props.extraRow}
                >
                    {this._renderTransfer()}
                    {(this.state.isSettleModalVisible ||
                        this.state.isSettleModalVisibleBefore) &&
                        this._renderSettleModal()}
                    {this._renderBorrowModal()}

                    {/* Burn Modal */}
                    {(this.state.isBurnModalVisible ||
                        this.state.isBurnModalVisibleBefore) && (
                        <ReserveAssetModal
                            visible={this.state.isBurnModalVisible}
                            hideModal={this.hideBurnModal}
                            asset={this.state.reserve}
                            account={this.props.account}
                            onClose={() => {
                                ZfApi.publish("reserve_asset", "close");
                            }}
                        />
                    )}
                </PaginatedList>
            </div>
        );
    }
}

AccountPortfolioList = connect(AccountPortfolioList, {
    listenTo() {
        return [SettingsStore, MarketsStore, WalletUnlockStore];
    },
    getProps() {
        return {
            settings: SettingsStore.getState().settings,
            viewSettings: SettingsStore.getState().viewSettings,
            allMarketStats: MarketsStore.getState().allMarketStats,
            locked: WalletUnlockStore.getState().locked
        };
    }
});

AccountPortfolioList = debounceRender(AccountPortfolioList, 50, {
    leading: false
});

export default AccountPortfolioList;
