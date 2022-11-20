import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import { RatingBetItem, RatingBetItemMobile } from "./RatingBetItem";
import RatingBetModal from "./RatingBetModal";
import { Apis } from "bitsharesjs-ws";


class RatingBetMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true,
            betTableData: [],
            teamList: [],
            intervalID: 0
        };

        this.myRef = React.createRef();
    }

    UNSAFE_componentWillMount() {
        this.getRatingTable();

        this.setState({
            intervalID: setInterval(this.getRatingTable.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getRatingTable() {
        Apis.instance()
            .db_api()
            .exec("gr_get_range_bets", [])
            .then(ratingTable => {
                this.setState({
                    betTableData: ratingTable
                });
            });

        Apis.instance()
            .db_api()
            .exec("gr_get_rating", ["race"])
            .then(ratingData => {
                this.setState({
                    teamList: ratingData
                });
            });
    }

    showBetModal() {
        this.setState({
            isModalVisible: true
        });
    }

    closeBetModal() {
        this.setState({
            isModalVisible: false
        });
    }

    executeScroll = () => this.myRef.current.scrollIntoView()

    render() {
        let { betTableData, isModalVisible, teamList } = this.state;
        let { currentAccount, isDisabled } = this.props;
        let deviceWidth = window.innerWidth;

        return (
            <section>
                {/* HEADER */}
                <div className="bet-table__title-wrap">
                    <Translate
                        className="cwd-common__subtitle"
                        content="great_race.gr_bets.current_bets_title"
                    />

                    <button
                        className="cwd-btn__square-btn"
                        onClick={this.showBetModal.bind(this)}
                        disabled={isDisabled}
                    >
                        <Translate content="great_race.gr_bets.make_new_bet_btn" />

                        <NewIcon
                            iconClass={"my-team-wrap__btn-plus"}
                            iconWidth={13}
                            iconHeight={13}
                            iconName={"icon_plus"}
                        />
                    </button>
                </div>

                {/* BETS TABLE */}
                {betTableData.length > 0 ?
                    <div className="bet-table__wrap">
                        <div className="bet-table">
                            {deviceWidth > 768 ?
                                <div className="bet-table__header">
                                    <Translate content="great_race.gr_bets.rating_bets.team_name" />
                                    <Translate content="great_race.gr_bets.rating_bets.place_range" />
                                    <Translate content="great_race.gr_bets.bet_result" />
                                </div>
                                : null}


                            {betTableData.map(item => (

                                deviceWidth > 768 ?
                                    <RatingBetItem
                                        currentAccount={currentAccount}
                                        key={item["id"]}
                                        teamBetId={item["team_id"]}
                                        teamName={item["name"]}
                                        teamLogo={item["img"]}
                                        lowerRank={item["lower_rank"]}
                                        upperRank={item["upper_rank"]}
                                        totalTrueBets={item["total_true_bets"]}
                                        totalFalseBets={item["total_false_bets"]}
                                        showBetModal={this.showBetModal.bind(this)}
                                        isDisabled={isDisabled}
                                    />
                                    :
                                    <RatingBetItemMobile
                                        currentAccount={currentAccount}
                                        key={item["id"]}
                                        teamBetId={item["team_id"]}
                                        teamName={item["name"]}
                                        teamLogo={item["img"]}
                                        lowerRank={item["lower_rank"]}
                                        upperRank={item["upper_rank"]}
                                        totalTrueBets={item["total_true_bets"]}
                                        totalFalseBets={item["total_false_bets"]}
                                        showBetModal={this.showBetModal.bind(this)}
                                        isDisabled={isDisabled}
                                    />
                            ))}
                        </div>
                    </div>
                    :
                    
                    isDisabled ?
                        <Translate
                            className="gr-content__description-text bet-table__no-bets-text"
                            content="great_race.gr_bets.no_bet_interval" />
                        :
                        <Translate
                            className="gr-content__description-text bet-table__no-bets-text"
                            content="great_race.gr_bets.no_bet_text" />
                }

                {isModalVisible ?
                    <RatingBetModal
                        isModalVisible={isModalVisible}
                        teamList={teamList}
                        closeBetModal={this.closeBetModal.bind(this)}
                        currentAccount={currentAccount}
                    />
                    : null}
            </section>
        );
    }
}

export default RatingBetMap;