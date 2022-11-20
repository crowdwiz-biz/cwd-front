import React from "react";
import Translate from "react-translate-component";
import {Tabs, Tab} from "../../Utility/Tabs";
import OpenedTrades from "./OpenedTrades";
import TradeHistory from "./TradeHistory";
import {Apis} from "bitsharesjs-ws";

//STYLES
import "../scss/cwdgateway-active.scss";

class GatewayOpenTrades extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            openTrades: [],
            confirmedTrades: [],
            intervalID: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            JSON.stringify(nextState) !== JSON.stringify(this.state) ||
            JSON.stringify(nextProps) !== JSON.stringify(this.props)
        );
    }

    UNSAFE_componentWillMount() {
        this.getOpenTrades();

        this.setState({
            intervalID: setInterval(this.getOpenTrades.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getOpenTrades() {
        let currentAccount = this.props.currentAccount;

        Apis.instance()
            .db_api()
            .exec("get_gateway_p2p_orders", [currentAccount, 1])
            .then(openTradesGateway => {
                this.setState({
                    openTrades: openTradesGateway
                });
            });
        Apis.instance()
            .db_api()
            .exec("get_gateway_p2p_orders", [currentAccount, 99])
            .then(confirmedTradesGateway => {
                this.setState({
                    confirmedTrades: confirmedTradesGateway
                });
            });
    }

    render() {
        let openTrades = this.state.openTrades;
        let confirmedTrades = this.state.confirmedTrades;
        let currentAccount = this.state.currentAccount;

        return (
            <div>
                <Tabs
                    className="cwd-tabs cwd-tabs--cascade-mode"
                    tabsClass="cwd-tabs__list"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab
                        title="cwdgateway.exchange.open_trades.new_trades"
                        className={openTrades ? "cwd-tabs__item-counter" : null}
                        counter={openTrades.length}
                    >
                        {openTrades.length > 0 ? (
                            <ul className="cwdgateway-active__list">
                                {openTrades.map(activeItem => (
                                    <OpenedTrades
                                        key={activeItem["po"]["id"]}
                                        openTrades={activeItem}
                                        currentAccount={currentAccount}
                                        shortView={true}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <Translate
                                className="cwdgateway__no-data"
                                content="cwdgateway.no_active_trades"
                            />
                        )}
                    </Tab>
                    <Tab
                        title="cwdgateway.exchange.open_trades.confirmed_trades"
                        className={confirmedTrades ? "cwd-tabs__item-counter" : null}
                        counter={confirmedTrades.length}
                    >
                        {confirmedTrades.length > 0 ? (
                            <ul className="cwdgateway-active__list">
                                {confirmedTrades.map(confirmedItem => (
                                    <OpenedTrades
                                        key={confirmedItem["po"]["id"]}
                                        openTrades={confirmedItem}
                                        currentAccount={currentAccount}
                                        shortView={true}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <Translate
                                className="cwdgateway__no-data"
                                content="cwdgateway.no_confirmed_trades"
                            />
                        )}
                    </Tab>
                    <Tab title="cwdgateway.exchange.archive_trades.trades_hist">
                        <TradeHistory currentAccount={currentAccount} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default GatewayOpenTrades;
