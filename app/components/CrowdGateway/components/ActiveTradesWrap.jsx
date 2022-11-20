import React from "react";
import Translate from "react-translate-component";
import EditTradeForm from "./Forms/EditTradeForm";
import {Apis} from "bitsharesjs-ws";

class ActiveTradesWrap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            showEditForm: false,
            tradeItem: [],
            intervalID: 0
        };
    }

    UNSAFE_componentWillMount() {
        this.getActiveTrades();

        this.setState({
            intervalID: setInterval(this.getActiveTrades.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getActiveTrades() {
        let currentAccount = this.props.currentAccount;

        Apis.instance()
            .db_api()
            .exec("get_my_p2p_adv", [currentAccount, 1])
            .then(activetrades => {
                this.setState({
                    tradeItem: activetrades
                });
            });
    }

    render() {
        let tradeItem = this.state.tradeItem;
        let currentAccount = this.state.currentAccount;

        return (
            <div>
                {tradeItem.length > 0 ? (
                    <ul className="cwdgateway-active__list">
                        {tradeItem.map(tradeItem => (
                            <EditTradeForm
                                key={tradeItem["id"]}
                                tradeItem={tradeItem}
                                currentAccount={currentAccount}
                                history={this.props.history}
                            />
                        ))}
                    </ul>
                ) : (
                    <Translate
                        className="cwdgateway__no-data"
                        content="cwdgateway.no_active_trades"
                    />
                )}
            </div>
        );
    }
}

export default ActiveTradesWrap;
