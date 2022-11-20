import React from "react";
import {Tabs, Tab} from "../../Utility/Tabs";
import PledgeOfferForm from "./Forms/PledgeOfferForm";
import ActivePledgesWrap from "./ActivePledgesWrap";
import PledgeOpHistory from "./PledgeOpHistory";
import CurrentPledgeOffersWrap from "./CurrentPledgeOffersWrap";

class UserPledgeOfferBlock extends React.Component {
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
                    {/* CREATE PLEDGE OFFER */}
                    <Tab title="crowd_pledge.exchange.title">
                        <PledgeOfferForm currentAccount={currentAccount} />
                    </Tab>

                    {/* ACTIVE PLEDGE OFFERS */}
                    <Tab title="crowd_pledge.exchange.active_exchange_title">
                        <ActivePledgesWrap currentAccount={currentAccount} />
                    </Tab>

                    {/* MY PLEDGER OFFERS */}
                    <Tab title="crowd_pledge.exchange.my_pledges_title">
                        <CurrentPledgeOffersWrap
                            currentAccount={currentAccount}
                        />
                    </Tab>

                    {/* PLEDGE OFFER OP HISTORY */}
                    <Tab title="crowd_pledge.exchange.open_pledges_title">
                        <PledgeOpHistory currentAccount={currentAccount} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default UserPledgeOfferBlock;
