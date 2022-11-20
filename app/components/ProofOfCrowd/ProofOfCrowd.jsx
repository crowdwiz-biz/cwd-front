import React from "react";
import Translate from "react-translate-component";
import {connect} from "alt-react";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import VotingBlock from "./components/VotingBlock";
import {Apis} from "bitsharesjs-ws";
import NewIcon from "../NewIcon/NewIcon";
import {Collapse} from "react-bootstrap";
import SettingsStore from "stores/SettingsStore";

import "./scss/proof_of_crowd.scss";

let headerImg = require("assets/headers/proof-of-crowd_header.png");

class Investment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            silverBalance: 0,
            currentAccount: null,
            canAccountVote: false,
            dgpo: {},
            gpo: {staking_parameters: {poc_vote_duration: 0}},
            open: true,
            currentLocale: SettingsStore.getState().settings.get("locale"),
            hasVoted: false
        };
    }

    componentDidMount() {
        let accountObj = this.props.account;

        if (accountObj) {
            let statistics = accountObj.getIn(["statistics"]);
            let userName = accountObj.get("id");

            this.setState({
                currentAccount: userName
            });
            if (statistics) {
                Apis.instance()
                    .db_api()
                    .exec("get_objects", [[statistics]])
                    .then(aso => {
                        this.setState({
                            had_staking: aso[0]["had_staking"],
                            hasVoted:
                                aso[0]["poc3_vote"] != 0 ||
                                aso[0]["poc3_vote"] != 0 ||
                                aso[0]["poc3_vote"] != 0
                        });
                    });
            }

            Apis.instance()
                .db_api()
                .exec("get_dynamic_global_properties", [])
                .then(dgpo => {
                    this.setState({
                        dgpo: dgpo
                    });
                });

            Apis.instance()
                .db_api()
                .exec("get_global_properties", [])
                .then(gpo => {
                    this.setState({
                        gpo: gpo
                    });
                });
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    setCollapseOpen(open) {
        this.setState({
            open: open
        });
    }

    render() {
        let currentAccount = this.state.currentAccount;
        let canAccountVote = this.state.had_staking;
        let isActiveVoting = this.state.dgpo.poc_vote_is_active;
        let hasVoted = this.state.hasVoted;

        let options = {year: "numeric", month: "long", day: "numeric"};
        let options_hm = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        };

        let duration = this.state.gpo.staking_parameters.poc_vote_duration;

        // current voting start date
        let myStdate = new Date(this.state.dgpo.end_poc_vote_time + "Z");
        myStdate.setSeconds(myStdate.getSeconds() - duration);
        let startDate = myStdate.toLocaleString();

        // current voting finish date
        var myFinishdate = new Date(this.state.dgpo.end_poc_vote_time + "Z");
        let finishDate = myFinishdate.toLocaleString();

        // last voting date
        let myLastdate = new Date(this.state.dgpo.end_poc_vote_time + "Z");
        let lastVoteDate = myLastdate.toLocaleString(
            this.state.currentLocale,
            options
        );

        // next voting date
        let myNextdate = new Date(this.state.dgpo.next_poc_vote_time + "Z");
        let nextVoteDate = myNextdate.toLocaleString(
            this.state.currentLocale,
            options_hm
        );

        return (
            <section className="cwd-common__wrap proof_of_crowd__wrap">
                <div className="proof_of_crowd__header">
                    <img src={headerImg} alt="investment" />
                </div>

                {isActiveVoting ? (
                    canAccountVote ? (
                        <div>
                            {/* TITLE */}
                            <span className="proof_of_crowd__title">
                                Proof&nbsp;
                                <span>of Crowd</span>
                            </span>

                            <div className="proof_of_crowd__intro">
                                <Collapse in={!this.state.open}>
                                    <div
                                        className="proof_of_crowd__desc-block proof_of_crowd__desc-block--short-view"
                                        id="example-collapse-text"
                                    >
                                        <Translate
                                            className="cwd-common__description proof_of_crowd__intro-text"
                                            content="proof_of_crowd.description_01"
                                            component="p"
                                        />
                                        <Translate
                                            className="cwd-common__description proof_of_crowd__intro-text"
                                            content="proof_of_crowd.description_02"
                                            component="p"
                                        />

                                        <Translate
                                            className="proof_of_crowd__intro-text"
                                            content="proof_of_crowd.description_04"
                                            component="p"
                                        />
                                    </div>
                                </Collapse>

                                <button
                                    onClick={this.setCollapseOpen.bind(
                                        this,
                                        !this.state.open
                                    )}
                                    className="proof_of_crowd__details-btn"
                                >
                                    {this.state.open ? (
                                        <Translate content="proof_of_crowd.show_more_btn" />
                                    ) : (
                                        <Translate content="proof_of_crowd.hide_details_btn" />
                                    )}

                                    <NewIcon
                                        iconClass={
                                            this.state.open ? "" : "hide-arrow"
                                        }
                                        iconWidth={15}
                                        iconHeight={8}
                                        iconName={"show_more_arrow"}
                                    />
                                </button>

                                <span className="proof_of_crowd__term-text">
                                    <Translate content="proof_of_crowd.poc_start" />{" "}
                                    <span className="proof_of_crowd__term-date">
                                        {startDate}
                                    </span>
                                </span>

                                <span className="proof_of_crowd__term-text">
                                    <Translate content="proof_of_crowd.poc_finish" />{" "}
                                    <span className="proof_of_crowd__term-date">
                                        {finishDate}
                                    </span>
                                </span>
                            </div>

                            {hasVoted ? (
                                <Translate
                                    className="proof_of_crowd__has-voted-text"
                                    content="proof_of_crowd.has_voted"
                                />
                            ) : (
                                <VotingBlock currentAccount={currentAccount} />
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="proof_of_crowd__intro">
                                {/* TITLE */}
                                <span className="proof_of_crowd__title">
                                    Proof&nbsp;
                                    <span>of Crowd</span>
                                </span>

                                <Translate
                                    className="cwd-common__description proof_of_crowd__intro-text"
                                    content="proof_of_crowd.description_01"
                                    component="p"
                                />
                            </div>
                        </div>
                    )
                ) : (
                    <div>
                        <div className="proof_of_crowd__intro">
                            {/* TITLE */}
                            <span className="proof_of_crowd__title">
                                Proof&nbsp;
                                <span>of Crowd</span>
                            </span>

                            <Translate
                                className="cwd-common__description proof_of_crowd__intro-text"
                                content="proof_of_crowd.description_01"
                                component="p"
                            />

                            <span className="proof_of_crowd__term-text">
                                <Translate content="proof_of_crowd.description_finished" />
                                &nbsp;
                                <span className="proof_of_crowd__term-date">
                                    {lastVoteDate}
                                </span>
                            </span>

                            <span className="proof_of_crowd__term-text">
                                <Translate content="proof_of_crowd.next_vote_date" />
                                &nbsp;
                                <span className="proof_of_crowd__term-date">
                                    {nextVoteDate}
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </section>
        );
    }
}

export default Investment = connect(Investment, {
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
