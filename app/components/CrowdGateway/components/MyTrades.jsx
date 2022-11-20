import React from "react";
import Translate from "react-translate-component";
import {Tabs, Tab} from "../../Utility/Tabs";
import TradeHistory from "./TradeHistory";
import OpenedTrades from "./OpenedTrades";

//STYLES
import "../scss/cwdgateway-active.scss";

class MyTrades extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount
        };
    }

    render() {
        let openTrades = this.props.myTrades;
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
                    <Tab title="cwdgateway.my_trades.opened_trades">
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
                    <Tab title="cwdgateway.my_trades.trades_archive">
                        <TradeHistory currentAccount={currentAccount} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default MyTrades;
