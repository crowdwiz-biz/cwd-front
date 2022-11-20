import React from "react";
import Translate from "react-translate-component";
import MyActivePledgeOffers from "./MyActivePledgeOffers";
import {Apis} from "bitsharesjs-ws";

class ActivePledgesWrap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            showEditForm: false,
            pledgeItem: [],
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
            .exec("pledge_get_offers_by_account", [currentAccount])
            .then(pledgeOffers => {
                let pledgeItem = [];

                pledgeOffers.forEach(offer => {
                    if (offer.status == 0) {
                        pledgeItem.push(offer);
                    }
                });

                this.setState({
                    pledgeItem: pledgeItem
                });
            });
    }

    render() {
        let pledgeItem = this.state.pledgeItem;
        let currentAccount = this.state.currentAccount;

        return (
            <div>
                {pledgeItem.length > 0 ? (
                    <ul className="pledge-offer__list">
                        {pledgeItem.map(pledgeItem => (
                            <MyActivePledgeOffers
                                key={pledgeItem["id"]}
                                pledgeItem={pledgeItem}
                                currentAccount={currentAccount}
                            />
                        ))}
                    </ul>
                ) : (
                    <Translate
                        className="pledge-common__no-data"
                        content="crowd_pledge.no_active_pledges"
                    />
                )}
            </div>
        );
    }
}

export default ActivePledgesWrap;
