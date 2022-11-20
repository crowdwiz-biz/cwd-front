import React from "react";
import { Tabs, Tab } from "../../Utility/Tabs";
import TradeItemBuy from "./TradeItemBuy";
import TradeItemSell from "./TradeItemSell";
import { Apis } from "bitsharesjs-ws";
import Translate from "react-translate-component";
import TradeSorterFilter from "./Utility/TradeSorterFilter";
import { ChainStore } from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import { connect } from "alt-react";
import LinkToAccountById from "../../Utility/LinkToAccountById";


//STYLES
import "../scss/cwdgateway-active.scss";
import "../scss/cwdgateway-popup.scss";

class ActiveAdsList extends React.Component {
    constructor(props) {
        super(props);
        var url_string = window.location.href;
        var url = new URL(url_string);
        var urlFilter = url.searchParams.get("filter");

        this.state = {
            buyAds: [],
            sellAds: [],
            currentAccount: this.props.currentAccount,
            valideAmount: false,
            intervalID: 0,
            isSorted: false,
            findAccount: "",
            searchstring: "",
            urlFilter: urlFilter,
            filterAccount: urlFilter
        };

        this.sortByExRate = this.sortByExRate.bind(this);
        this.sortByRating = this.sortByRating.bind(this);
        this.filterBySearchValue = this.filterBySearchValue.bind(this);
        this.showAllTrades = this.showAllTrades.bind(this);

    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            JSON.stringify(nextState.buyAds) !==
            JSON.stringify(this.state.buyAds) ||
            JSON.stringify(nextState.sellAds) !==
            JSON.stringify(this.state.sellAds) ||
            nextState.isSorted !== this.state.isSorted ||
            nextState.searchstring !== this.state.searchstring
        );
    }

    componentDidMount() {
        this.getAds();

        this.setState({
            intervalID: setInterval(this.getAds.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    getAds() {
        let currentAccount = this.props.currentAccount;
        let gateways = [];
        let scamAccounts = this.props.scamAccounts;

        if (scamAccounts) {
            let blacklistedAds = scamAccounts.get("blacklisted_accounts");

            Apis.instance()
                .db_api()
                .exec("get_p2p_adv", [currentAccount, 1])
                .then(tradesBuy => {
                    // filter traders by inifinity status
                    for (let trade in tradesBuy) {
                        gateways.push(tradesBuy[trade]['pa']["p2p_gateway"]);
                    }
                    let unique = gateways.filter(this.onlyUnique);

                    Apis.instance()
                        .db_api()
                        .exec("get_objects", [unique])
                        .then(accounts => {

                            let allowedAccounts = [];
                            let allowedTradesBuy = [];

                            // check if infinity && if in DEX blacklist
                            for (let account in accounts) {
                                if (accounts[account]['referral_status_type'] == 4 && blacklistedAds.indexOf(accounts[account]['id']) == -1) {
                                    allowedAccounts.push(accounts[account]['id'])
                                }
                            }

                            for (let trade in tradesBuy) {
                                if (allowedAccounts.includes(tradesBuy[trade]['pa']["p2p_gateway"])
                                    // check if price max > min && max > 2
                                    && tradesBuy[trade]['pa']['max_cwd'] > 200000
                                ) {
                                    allowedTradesBuy.push(tradesBuy[trade])
                                }
                            }

                            this.setState({
                                buyAds: allowedTradesBuy
                            });
                        });
                });

            Apis.instance()
                .db_api()
                .exec("get_p2p_adv", [currentAccount, 0])
                .then(tradesSell => {
                    // filter traders by inifinity status
                    for (let trade in tradesSell) {
                        gateways.push(tradesSell[trade]['pa']["p2p_gateway"]);
                    }
                    let unique = gateways.filter(this.onlyUnique);

                    Apis.instance()
                        .db_api()
                        .exec("get_objects", [unique])
                        .then(accounts => {
                            let allowedAccounts = [];
                            let allowedTradesSell = []

                            // check if infinity && if in DEX blacklist
                            for (let account in accounts) {
                                if (accounts[account]['referral_status_type'] == 4 && blacklistedAds.indexOf(accounts[account]['id']) == -1) {
                                    allowedAccounts.push(accounts[account]['id'])
                                }
                            }
                            for (let trade in tradesSell) {
                                if (allowedAccounts.includes(tradesSell[trade]['pa']["p2p_gateway"])
                                    // check if price max > min && max > 2
                                    && tradesSell[trade]['pa']['min_cwd'] > 200000
                                ) {
                                    allowedTradesSell.push(tradesSell[trade])
                                }
                            }

                            this.setState({
                                sellAds: allowedTradesSell
                            });
                        });
                });
        }
    }

    sortByExRate() {
        this.setState({
            isSorted: false
        });
    }

    sortByRating() {
        this.setState({
            isSorted: true
        });
    }

    filterBySearchValue() {
        let value = document.getElementById("tradeAdsFilter").value.trim();
        value = value.toLowerCase();

        this.setState({
            searchstring: value
        });
    }

    showAllTrades() {
        document.getElementById("tradeAdsFilter").value = "";

        this.setState({
            searchstring: ""
        });
    }

    removeAdsFilter() {
        if (this.state.urlFilter == null) {
            this.setState({
                urlFilter: this.state.filterAccount
            });
        }
        else {
            this.setState({
                urlFilter: null
            });
        }
    }

    render() {
        let { searchstring, isSorted, currentAccount, urlFilter } = this.state;

        let buyAds_non_filter = this.state.buyAds;
        let buyAds = [];
        buyAds_non_filter.map(activeItem => {
            if (searchstring != "" || urlFilter != null) {
                if ((searchstring != "" && (
                    activeItem["pa"]["adv_description"]
                        .toLowerCase()
                        .search(searchstring) != -1 ||
                    activeItem["pa"]["geo"]
                        .toLowerCase()
                        .search(searchstring) != -1 ||
                    activeItem["pa"]["currency"]
                        .toLowerCase()
                        .search(searchstring) != -1))
                    ||
                    (urlFilter != null && activeItem["pa"]["p2p_gateway"] == urlFilter)) {
                    buyAds.push(activeItem);
                }
            }
            else {
                buyAds.push(activeItem);
            }
        });
        let buyAdsSorted = buyAds_non_filter.sort((a, b) => {
            return parseInt(b.rating) - parseInt(a.rating);
        });

        let topAccountsBuy = [];
        let topNumber = 5;
        buyAdsSorted.map(activeItem => {
            if (
                topAccountsBuy.length < topNumber &&
                !topAccountsBuy.includes(activeItem["pa"]["p2p_gateway"])
            ) {
                topAccountsBuy.push(activeItem["pa"]["p2p_gateway"]);
            }
        });
        let sellAds_non_filter = this.state.sellAds;
        let sellAds = [];
        sellAds_non_filter.map(activeItem => {
            if (searchstring != "" || urlFilter != null) {
                if ((searchstring != "" && (
                    activeItem["pa"]["adv_description"]
                        .toLowerCase()
                        .search(searchstring) != -1 ||
                    activeItem["pa"]["geo"]
                        .toLowerCase()
                        .search(searchstring) != -1 ||
                    activeItem["pa"]["currency"]
                        .toLowerCase()
                        .search(searchstring) != -1))
                    ||
                    (urlFilter != null && activeItem["pa"]["p2p_gateway"] == urlFilter)) {
                    sellAds.push(activeItem);
                }
            } else {
                sellAds.push(activeItem);
            }
        });

        let sellAdsSorted = sellAds_non_filter.sort((a, b) => {
            return parseInt(b.rating) - parseInt(a.rating);
        });

        let topAccountsSell = [];

        sellAdsSorted.map(activeItem => {
            if (
                topAccountsSell.length < topNumber &&
                !topAccountsSell.includes(activeItem["pa"]["p2p_gateway"])
            ) {
                topAccountsSell.push(activeItem["pa"]["p2p_gateway"]);
            }
        });

        let filterAccount = this.state.filterAccount;


        return (
            <div>
                <Tabs
                    className="cwd-tabs cwd-tabs--cascade-mode"
                    tabsClass="cwd-tabs__list"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab title="cwdgateway.ads.buy_cwd">
                        <TradeSorterFilter
                            isSorted={isSorted}
                            sortByExRate={this.sortByExRate}
                            sortByRating={this.sortByRating}
                            filterBySearchValue={this.filterBySearchValue}
                            showAllTrades={this.showAllTrades}
                        />

                        {filterAccount != null ? urlFilter != null ?
                            <div className="cwdgateway-active__filter-btn-wrap">
                                <button
                                    type="button"
                                    className="cwd-btn__action-btn"
                                    onClick={this.removeAdsFilter.bind(this)}
                                >
                                    <Translate content="cwdgateway.ads.remove_filter_btn" />
                                </button>
                            </div>
                            :
                            <div className="cwdgateway-active__filter-btn-wrap">
                                <button
                                    type="button"
                                    className="cwd-btn__action-btn"
                                    onClick={this.removeAdsFilter.bind(this)}
                                >
                                    <Translate content="cwdgateway.ads.filter_from" />
                                    &nbsp;
                                    <LinkToAccountById
                                        noLink={true}
                                        account={filterAccount}
                                    />
                                </button>
                            </div>
                            : null}

                        {buyAds.length > 0 ? (
                            <ul className="cwdgateway-active__list">
                                {isSorted
                                    ? buyAds
                                        .sort((a, b) => {
                                            return (
                                                parseInt(b.rating) -
                                                parseInt(a.rating)
                                            );
                                        })
                                        .map(activeItem =>
                                            activeItem["pa"]["max_cwd"] >=
                                                activeItem["pa"]["min_cwd"] ? (
                                                <TradeItemBuy
                                                    key={
                                                        activeItem["pa"]["id"]
                                                    }
                                                    buyAds={activeItem}
                                                    currentAccount={
                                                        currentAccount
                                                    }
                                                    isTop={
                                                        topAccountsBuy.includes(
                                                            activeItem["pa"][
                                                            "p2p_gateway"
                                                            ]
                                                        )
                                                            ? true
                                                            : false
                                                    }
                                                    history={this.props.history}
                                                />
                                            ) : null
                                        )
                                    : buyAds
                                        .sort((a, b) => {
                                            if (
                                                parseInt(b.pa.price) <
                                                parseInt(a.pa.price)
                                            )
                                                return 1;
                                            else if (
                                                parseInt(b.pa.price) >
                                                parseInt(a.pa.price)
                                            )
                                                return -1;
                                            else
                                                return (
                                                    parseInt(b.rating) -
                                                    parseInt(a.rating)
                                                );
                                        })
                                        .map(activeItem =>
                                            activeItem["pa"]["max_cwd"] >=
                                                activeItem["pa"]["min_cwd"] ? (
                                                <TradeItemBuy
                                                    key={
                                                        activeItem["pa"]["id"]
                                                    }
                                                    buyAds={activeItem}
                                                    currentAccount={
                                                        currentAccount
                                                    }
                                                    isTop={
                                                        topAccountsBuy.includes(
                                                            activeItem["pa"][
                                                            "p2p_gateway"
                                                            ]
                                                        )
                                                            ? true
                                                            : false
                                                    }
                                                    history={this.props.history}
                                                />
                                            ) : null
                                        )}
                            </ul>
                        ) : (
                            <Translate
                                className="cwdgateway__no-data"
                                content="cwdgateway.ads.no_buy_trades"
                            />
                        )}
                    </Tab>

                    <Tab title="cwdgateway.ads.sell_cwd">
                        <TradeSorterFilter
                            isSorted={isSorted}
                            sortByExRate={this.sortByExRate}
                            sortByRating={this.sortByRating}
                            filterBySearchValue={this.filterBySearchValue}
                            showAllTrades={this.showAllTrades}
                        />

                        {filterAccount != null ? urlFilter != null ?
                            <div className="cwdgateway-active__filter-btn-wrap">
                                <button
                                    type="button"
                                    className="cwd-btn__action-btn"
                                    onClick={this.removeAdsFilter.bind(this)}
                                >
                                    <Translate content="cwdgateway.ads.remove_filter_btn" />
                                </button>
                            </div>
                            :
                            <div className="cwdgateway-active__filter-btn-wrap">
                                <button
                                    type="button"
                                    className="cwd-btn__action-btn"
                                    onClick={this.removeAdsFilter.bind(this)}
                                >
                                    <Translate content="cwdgateway.ads.filter_from" />
                                    &nbsp;
                                    <LinkToAccountById
                                        noLink={true}
                                        account={filterAccount}
                                    />
                                </button>
                            </div>
                            : null}
                            
                        {sellAds.length > 0 ? (
                            <ul className="cwdgateway-active__list">
                                {isSorted
                                    ? sellAds
                                        .sort((a, b) => {
                                            return (
                                                parseInt(b.rating) -
                                                parseInt(a.rating)
                                            );
                                        })
                                        .map(activeItem => (
                                            <TradeItemSell
                                                key={activeItem["pa"]["id"]}
                                                sellAds={activeItem}
                                                currentAccount={
                                                    currentAccount
                                                }
                                                isTop={
                                                    topAccountsSell.includes(
                                                        activeItem["pa"][
                                                        "p2p_gateway"
                                                        ]
                                                    )
                                                        ? true
                                                        : false
                                                }
                                                history={this.props.history}
                                            />
                                        ))
                                    : sellAds
                                        .sort((a, b) => {
                                            if (
                                                parseInt(b.pa.price) <
                                                parseInt(a.pa.price)
                                            )
                                                return -1;
                                            else if (
                                                parseInt(b.pa.price) >
                                                parseInt(a.pa.price)
                                            )
                                                return 1;
                                            else
                                                return (
                                                    parseInt(b.rating) -
                                                    parseInt(a.rating)
                                                );
                                        })
                                        .map(activeItem => (
                                            <TradeItemSell
                                                key={activeItem["pa"]["id"]}
                                                sellAds={activeItem}
                                                currentAccount={
                                                    currentAccount
                                                }
                                                isTop={
                                                    topAccountsSell.includes(
                                                        activeItem["pa"][
                                                        "p2p_gateway"
                                                        ]
                                                    )
                                                        ? true
                                                        : false
                                                }
                                                history={this.props.history}
                                            />
                                        ))}
                            </ul>
                        ) : (
                            <Translate
                                className="cwdgateway__no-data"
                                content="cwdgateway.ads.no_sell_trades"
                            />
                        )}
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default ActiveAdsList = connect(ActiveAdsList, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            scamAccounts: ChainStore.fetchFullAccount("scam-accounts")
        };
    }
});