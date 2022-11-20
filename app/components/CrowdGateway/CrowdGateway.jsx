import React from "react";
import Translate from "react-translate-component";
import { connect } from "alt-react";
import { Tabs, Tab } from "../Utility/Tabs";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import { Apis } from "bitsharesjs-ws";
import AccountInfo from "./components/AccountInfo";
import ActiveAdsList from "./components/ActiveAdsList";
import MyTrades from "./components/MyTrades";
import CreateTradeAd from "./components/CreateTradeAd";

//STYLES
import "./scss/cwdgateway.scss";

class CrowdGateway extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isExchange: false,
            currentAccount: AccountStore.getState().currentAccount,
            accountId: this.props.account,
            currentTime: "",
            data: {
                successful_trades: 0,
                cancelled_trades: 0,
                trades_max: 0,
                user_status: 0,
                exchange_status: 0,
                user_ban_time: ""
            },
            myTrades: [],
            intervalID: 0,
            exchangeNum: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            JSON.stringify(nextState) !== JSON.stringify(this.state) ||
            JSON.stringify(nextProps) !== JSON.stringify(this.props)
        );
    }

    UNSAFE_componentWillMount() {
        this.getAccountData();

        this.setState({
            intervalID: setInterval(this.getAccountData.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getAccountData() {
        if (this.props.account) {
            Apis.instance()
                .db_api()
                .exec("get_dynamic_global_properties", [])
                .then(blocks => {
                    this.setState({
                        currentTime: blocks.time
                    });

                    Apis.instance()
                        .db_api()
                        .exec("get_full_accounts", [
                            [this.props.account.get("name")],
                            false
                        ])
                        .then(stat => {
                            let trades_max =
                                parseInt(
                                    stat[0][1].account.referral_status_type
                                ) + 1;
                            if (trades_max == 0) {
                                trades_max = 1;
                            }
                            let user_status = 0;
                            let user_ban_time = "";
                            if (
                                new Date(this.state.currentTime + "Z") <
                                new Date(stat[0][1].statistics.p2p_banned + "Z")
                            ) {
                                user_status = 2;
                                user_ban_time = new Date(
                                    stat[0][1].statistics.p2p_banned + "Z"
                                ).toLocaleDateString("en-EN", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                            }
                            let statisticsData = {
                                successful_trades:
                                    stat[0][1].statistics.p2p_complete_deals,
                                cancelled_trades:
                                    stat[0][1].statistics.p2p_canceled_deals,
                                trades_max: trades_max,
                                user_status: user_status,
                                exchange_status:
                                    stat[0][1].statistics.p2p_gateway_active,
                                user_ban_time: user_ban_time
                            };
                            let isExchange = false;
                            if (
                                parseInt(
                                    stat[0][1].account.referral_status_type
                                ) == 4
                            ) {
                                isExchange = true;
                            }
                            this.setState({
                                data: statisticsData,
                                isExchange: isExchange
                            });
                        });
                });
            Apis.instance()
                .db_api()
                .exec("get_p2p_orders", [this.props.account.get("name")])
                .then(openTradesData => {
                    this.setState({
                        myTrades: openTradesData
                    });
                });
        } else {
            this.props.history.push("/create-account/password");
        }
        if (this.state.isExchange) {
            Apis.instance()
                .db_api()
                .exec("get_gateway_total_orders", [
                    this.props.account.get("name")
                ])
                .then(ordersData => {
                    this.setState({
                        exchangeNum: ordersData
                    });
                });
        }
    }

    render() {
        let accountId;

        if (this.state.accountId) {
            accountId = this.state.accountId.get("id");
        } else {
            this.props.history.push("/create-account/password");
        }
        let isExchange = this.state.isExchange;
        let myTrades = this.state.myTrades;


        return (
            <section className="cwd-common__wrap" key={accountId}>
                <Translate
                    className="cwd-common__title"
                    content="cwdgateway.title"
                />

                <AccountInfo
                    successfulTrades={this.state.data["successful_trades"]}
                    cancelledTrades={this.state.data["cancelled_trades"]}
                    tradesMax={this.state.data["trades_max"]}
                    userStatus={this.state.data["user_status"]}
                    exchangeStatus={this.state.data["exchange_status"]}
                    isExchange={isExchange}
                    userBanTime={this.state.data["user_ban_time"]}
                />


                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list cwd-tabs__list--cascade-mode"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    {isExchange ? (
                        <Tab
                            title="cwdgateway.exchange.tab"
                            className={this.state.exchangeNum > 0 ? "cwd-tabs__item-counter" : null}
                            counter={this.state.exchangeNum}
                        >
                            <CreateTradeAd
                                tradeItem={this.state.tradeItem}
                                currentAccount={accountId}
                                history={this.props.history}
                            />
                        </Tab>
                    ) : null}

                    <Tab title="cwdgateway.ads.title">
                        <ActiveAdsList
                            buyAds={this.state.buyAds}
                            sellAds={this.state.sellAds}
                            currentAccount={accountId}
                            history={this.props.history}
                        />
                    </Tab>
                    <Tab
                        title="cwdgateway.my_trades.title"
                        className={myTrades ? "cwd-tabs__item-counter" : null}
                        counter={myTrades ? myTrades.length : null}
                    >
                        <MyTrades
                            currentAccount={accountId}
                            myTrades={myTrades ? myTrades : null}
                        />
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

export default CrowdGateway = connect(CrowdGateway, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
