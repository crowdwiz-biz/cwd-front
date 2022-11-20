import React from "react";
import Translate from "react-translate-component";
import MyCurrentPledgeOffers from "./MyCurrentPledgeOffers";
import {Apis} from "bitsharesjs-ws";

class CurrentPledgeOffersWrap extends React.Component {
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
        this.getArchiveTrades();

        this.setState({
            intervalID: setInterval(this.getArchiveTrades.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getArchiveTrades() {
        let currentAccount = this.props.currentAccount;

        Apis.instance()
            .db_api()
            .exec("pledge_get_offers_by_account", [currentAccount])
            .then(pledgeOffers => {
                let pledgeItem = [];

                pledgeOffers.forEach(offer => {
                    if (offer.status == 1) {
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
                            <MyCurrentPledgeOffers
                                key={pledgeItem["id"]}
                                pledgeItem={pledgeItem}
                                currentAccount={currentAccount}
                            />
                        ))}
                    </ul>
                ) : (
                    <Translate
                        className="pledge-common__no-data"
                        content="crowd_pledge.no_archive_pledges"
                    />
                )}
            </div>
        );
    }
}

export default CurrentPledgeOffersWrap;
