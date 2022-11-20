import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import { Collapse } from "react-bootstrap";
import { Tabs, Tab } from "../../Utility/Tabs";
import RatingBetMap from "./utility/RatingBetMap";
import TeamBetMap from "./utility/TeamBetMap";
import { ChainStore } from "bitsharesjs";


let headerImg = require("assets/headers/great-race_header.jpg");


class GRBetIndex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true
        };
    }

    setCollapseOpen(open) {
        this.setState({
            open: open
        });
    }

    render() {
        let currentAccount = this.props.currentAccount;

        let dynGlobalObject = ChainStore.getObject("2.1.0");
        let currentStage = 1;
        let currentTime = "1970-01-01T00:00:00";
        let nextGrTime = "1970-01-01T00:00:00";
        let grBetIntervalTime = "1970-01-01T00:00:00";
        let isDisabled = true;
        if (dynGlobalObject) {
            currentStage = dynGlobalObject.get("current_gr_interval");
            currentTime = dynGlobalObject.get("time");
            nextGrTime = dynGlobalObject.get("next_gr_interval_time");
            grBetIntervalTime = dynGlobalObject.get("gr_bet_interval_time");

            if (!/Z$/.test(currentTime)) {
                currentTime += "Z";
            }
            if (!/Z$/.test(nextGrTime)) {
                nextGrTime += "Z";
            }
            let currentTimeDate = new Date(currentTime);
            let grBetIntervalTimeDate = new Date(grBetIntervalTime);
            if (currentTimeDate <= grBetIntervalTimeDate) {
                isDisabled = false;
            }
        }


        let noBetsInteval = [1, 3, 5, 7, 8, 10, 12, 14].includes(currentStage);

        return (
            <section className="gr-index__wrap bet-index">
                <img className="gr-index__header" src={headerImg} alt="" />

                <div className="gr-index__center-layout">
                    <Translate
                        className="cwd-common__title-upper-case"
                        content="great_race.gr_bets.title"
                    />

                    <div className="bet-index__desc-block">

                        <Collapse in={!this.state.open}>
                            <Translate
                                className="
                                    cwd-common__desc-block 
                                    cwd-common__desc-block--short-view 
                                    gr-content__description-text"
                                content="great_race.gr_bets.rules_text"
                                component="p"
                                unsafe
                            />
                        </Collapse>

                        <button
                            onClick={this.setCollapseOpen.bind(
                                this,
                                !this.state.open
                            )}
                            className="cwd-btn__show-more-btn noselect"
                        >
                            {this.state.open ? (
                                <Translate content="proof_of_crowd.show_more_btn" />
                            ) : (
                                <Translate content="proof_of_crowd.hide_details_btn" />
                            )}

                            <NewIcon
                                iconClass={this.state.open ? "" : "hide-arrow"}
                                iconWidth={15}
                                iconHeight={8}
                                iconName={"show_more_arrow"}
                            />
                        </button>
                    </div>

                    {noBetsInteval ?
                        <Translate
                            className="gr-content__description-text bet-table__no-bets-text"
                            content="great_race.gr_bets.no_bet_inreval" />
                        :
                        <Tabs
                            className="cwd-tabs"
                            tabsClass="cwd-tabs__list"
                            contentClass="cwd-tabs__content"
                            segmented={false}
                            actionButtons={false}
                        >
                            <Tab title="great_race.gr_bets.tab_rating_title">
                                <RatingBetMap
                                    currentAccount={currentAccount}
                                    isDisabled={isDisabled}
                                />
                            </Tab>
                            <Tab title="great_race.gr_bets.tab_team_title">
                                <TeamBetMap
                                    currentAccount={currentAccount}
                                    isDisabled={isDisabled}
                                />
                            </Tab>
                        </Tabs>}
                </div>
            </section >
        );
    }
}

export default GRBetIndex