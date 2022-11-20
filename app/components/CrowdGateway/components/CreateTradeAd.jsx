import React from "react";
import { Tabs, Tab } from "../../Utility/Tabs";
import TradeForm from "./Forms/TradeForm";
import ActiveTradesWrap from "./ActiveTradesWrap";
import GatewayOpenTrades from "./GatewayOpenTrades";
import EditArchiveTrade from "./EditArchiveTrade";

class CreateTradeAd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount
        };
    }
    render() {
        let currentAccount = this.state.currentAccount;

        return (
            <div>
                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list cwd-tabs__list--cascade-mode cwd-tabs__list--cascade-mode-inner"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    {/* OPEN TRADES */}
                    <Tab title="cwdgateway.exchange.open_trades.title">
                        <GatewayOpenTrades currentAccount={currentAccount} />
                    </Tab>

                    {/* ACTIVE TRADES */}
                    <Tab title="cwdgateway.exchange.active_exchange.title">
                        <ActiveTradesWrap
                            currentAccount={currentAccount}
                            history={this.props.history}
                        />
                    </Tab>

                    {/* ADD TRADE */}
                    <Tab title="cwdgateway.exchange.title">
                        <TradeForm currentAccount={currentAccount} />
                    </Tab>

                    {/* ARCHIVE TRADES */}
                    <Tab title="cwdgateway.exchange.archive_trades.title">
                        <EditArchiveTrade
                            currentAccount={currentAccount}
                            history={this.props.history}
                        />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default CreateTradeAd;
