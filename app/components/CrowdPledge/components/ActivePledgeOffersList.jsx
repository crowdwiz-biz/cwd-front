import React from "react";
import { Tabs, Tab } from "../../Utility/Tabs";
import PledgeOfferGive from "./PledgeOfferGive";
import PledgeOfferTake from "./PledgeOfferTake";
import { Apis } from "bitsharesjs-ws";
import Translate from "react-translate-component";

//STYLES
import "../scss/pledge-offer.scss";

class ActivePledgeOffersList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            giveOffers: [],
            takeOffers: [],
            currentAccount: this.props.currentAccount,
            valideAmount: false,
            intervalID: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            JSON.stringify(nextState.giveOffers) !==
            JSON.stringify(this.state.giveOffers) ||
            JSON.stringify(nextState.takeOffers) !==
            JSON.stringify(this.state.takeOffers)
        );
    }

    componentDidMount() {
        this.getPledgeOffers();

        this.setState({
            intervalID: setInterval(this.getPledgeOffers.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getPledgeOffers() {
        Apis.instance()
            .db_api()
            .exec("pledge_get_offers", [])
            .then(pledgeOffers => {
                let giveOffers = [];
                let takeOffers = [];

                pledgeOffers.forEach(offer => {
                    if (offer.creditor == "1.2.0") {
                        giveOffers.push(offer);
                    } else {
                        takeOffers.push(offer);
                    }
                });

                this.setState({
                    giveOffers: giveOffers,
                    takeOffers: takeOffers
                });
            });
    }

    render() {
        let giveOffers = this.state.giveOffers;
        let takeOffers = this.state.takeOffers;
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
                    <Tab title="crowd_pledge.ads.take_pledge">
                        {giveOffers.length > 0 ? (
                            <ul className="pledge-offer__list">
                                {giveOffers.map(pledgeItem => (
                                    <PledgeOfferGive
                                        key={pledgeItem["id"]}
                                        giveOffers={pledgeItem}
                                        currentAccount={currentAccount}
                                        history={this.props.history}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <Translate
                                className="pledge-common__no-data"
                                content="crowd_pledge.ads.no_active_pledges"
                            />
                        )}
                    </Tab>

                    <Tab title="crowd_pledge.ads.give_pledge">
                        {takeOffers.length > 0 ? (
                            <ul className="pledge-offer__list">
                                {takeOffers.map(pledgeItem => (
                                    <PledgeOfferTake
                                        key={pledgeItem["id"]}
                                        takeOffers={pledgeItem}
                                        currentAccount={currentAccount}
                                        history={this.props.history}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <Translate
                                className="pledge-common__no-data"
                                content="crowd_pledge.ads.no_active_pledges"
                            />
                        )}
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default ActivePledgeOffersList;
