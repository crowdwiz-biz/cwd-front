import React from "react";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import GRContent from "./GRContent";
import GRBetIndex from "./bet-components/GRBetIndex";
import { Tabs, Tab } from "../Utility/Tabs";
import { Apis } from "bitsharesjs-ws";

import "./scss/_all-gr.scss";


class GRIndex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newTeam: "",
            intervalID: 0
        };
    }

    componentWillMount() {
        if (this.props.account) {
            this.updateAccountData();

            this.setState({
                newTeam: this.props.account.get("gr_team"),
                intervalID: setInterval(this.updateAccountData.bind(this), 5000)
            });
        }
        else {
            this.props.history.push("/create-account/password");
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    updateAccountData() {
        Apis.instance()
            .db_api()
            .exec("get_objects", [[this.props.account.get("id")]])
            .then(data => {
                if (this.state.newTeam !== data[0]["gr_team"]) {
                    this.setState({
                        newTeam: data[0]["gr_team"]
                    });
                }
            });
    }

    render() {

        if (this.props.account) {
            let currentAccount = this.props.account;
            let newTeam = this.state.newTeam;

            return (
                <section className="gr-index__wrap">
                    {currentAccount ?
                        <Tabs
                            className="gr-tabs"
                            tabsClass="gr-tabs__list"
                            contentClass="gr__content"
                            segmented={false}
                            actionButtons={false}
                        >
                            <Tab title="great_race.tab_title_gr">
                                <GRContent
                                    currentAccount={currentAccount}
                                    newTeam={newTeam}
                                />
                            </Tab>
                            <Tab title="great_race.tab_title_betting">
                                <GRBetIndex currentAccount={currentAccount} />
                            </Tab>
                        </Tabs>
                        : null}
                </section>
            );
        }
        else {
            return null
        }
    }
}

export default GRIndex = connect(GRIndex, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});

