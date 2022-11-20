import React from "react";
import Translate from "react-translate-component";
import {connect} from "alt-react";
import {Tabs, Tab} from "../Utility/Tabs";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import ActivePledgeOffersList from "./components/ActivePledgeOffersList";
import UserPledgeOfferBlock from "./components/UserPledgeOfferBlock";

//STYLES
import "./scss/pledge-common.scss";

class CrowdPledgeIndex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            JSON.stringify(nextState) !== JSON.stringify(this.state) ||
            JSON.stringify(nextProps) !== JSON.stringify(this.props)
        );
    }

    render() {
        let accountId;
        if (this.state.account) {
            accountId = this.state.account.get("id");
        } else {
            this.props.history.push("/create-account/password");
        }

        return (
            <section className="cwd-common__wrap" key={accountId}>
                <Translate
                    className="cwd-common__title"
                    content="crowd_pledge.title"
                />

                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list cwd-tabs__list--cascade-mode"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab title="crowd_pledge.ads.title">
                        <ActivePledgeOffersList
                            buyAds={this.state.buyAds}
                            sellAds={this.state.sellAds}
                            currentAccount={accountId}
                            history={this.props.history}
                        />
                    </Tab>

                    <Tab title="crowd_pledge.exchange.tab">
                        <UserPledgeOfferBlock
                            currentAccount={accountId}
                        />
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

export default CrowdPledgeIndex = connect(CrowdPledgeIndex, {
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
