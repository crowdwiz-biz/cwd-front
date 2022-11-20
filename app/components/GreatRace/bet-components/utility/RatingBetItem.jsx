import React from "react";
import Translate from "react-translate-component";
import FormattedAsset from "../../../Utility/FormattedAsset";
import RatingBetModal from "./RatingBetModal";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");


class RatingBetItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true
        };
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

    render() {
        let deviceWidth = window.innerWidth;

        let {
            teamName,
            teamLogo,
            lowerRank,
            upperRank,
            totalTrueBets,
            totalFalseBets,
            teamBetId,
            isDisabled
        } = this.props;

        let { isModalVisible } = this.state;

        return (

            <div className="bet-table__item">
                <div className="bet-table__name-wrap">
                    <span
                        className="bet-table__logo"
                        style={{
                            backgroundImage: `url(${teamLogo.replace(
                                /http+[a-zA-Z0-9.:/]+ipfs/g,
                                apiUrl + "/ipfs"
                            )})`
                        }}
                    ></span>

                    <span className="bet-table__data bet-table__data--name">{teamName}</span>
                </div>


                <span>{lowerRank} - {upperRank}</span>

                <div className="bet-table__result-wrap">
                    <Translate
                        className="bet-table__data bet-table__data--true"
                        content="great_race.gr_bets.place_bets.bet_yes" />

                    <FormattedAsset
                        amount={totalTrueBets}
                        asset={"1.3.0"}
                        decimalOffset={5}
                        hide_asset={deviceWidth > 576 ? false : true}
                    />

                    <Translate
                        className="bet-table__data bet-table__data--false"
                        content="great_race.gr_bets.place_bets.bet_no" />

                    <FormattedAsset
                        amount={totalFalseBets}
                        asset={"1.3.0"}
                        decimalOffset={5}
                        hide_asset={deviceWidth > 576 ? false : true}
                    />
                </div>

                <button
                    type="button"
                    className="cwd-btn__action-btn"
                    onClick={this.showBetModal.bind(this)}
                    disabled={isDisabled}
                >
                    <Translate content="great_race.gr_bets.match_the_bet" />
                </button>

                {isModalVisible ?
                    <RatingBetModal
                        teamBetId={teamBetId}
                        selectedTeamName={teamName}
                        lowerRank={lowerRank}
                        upperRank={upperRank}
                        isModalVisible={isModalVisible}
                        closeBetModal={this.closeBetModal.bind(this)}
                        currentAccount={this.props.currentAccount}
                    />
                    : null}
            </div>
        );
    }
}

class RatingBetItemMobile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true
        };
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

    render() {
        let deviceWidth = window.innerWidth;

        let {
            teamName,
            teamLogo,
            lowerRank,
            upperRank,
            totalTrueBets,
            totalFalseBets,
            teamBetId
        } = this.props;

        let { isModalVisible } = this.state;

        return (
            <div className="bet-table__mobile-item">
                <div className="bet-table__mobile-row">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.rating_bets.team_name" />

                    <div className="bet-table__name-wrap">
                        <span
                            className="bet-table__logo"
                            style={{
                                backgroundImage: `url(${teamLogo.replace(
                                    /http+[a-zA-Z0-9.:/]+ipfs/g,
                                    apiUrl + "/ipfs"
                                )})`
                            }}
                        ></span>

                        <span className="bet-table__data bet-table__data--name">{teamName}</span>
                    </div>
                </div>

                <div className="bet-table__range-wrap">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.rating_bets.place_range" />

                    <span>{lowerRank} - {upperRank}</span>
                </div>

                <div className="bet-table__mobile-row">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.bet_result" />

                    <div className="bet-table__result-wrap">
                        <Translate
                            className="bet-table__data bet-table__data--true"
                            content="great_race.gr_bets.place_bets.bet_yes" />

                        <FormattedAsset
                            amount={totalTrueBets}
                            asset={"1.3.0"}
                            decimalOffset={5}
                            hide_asset={deviceWidth > 576 ? false : true}
                        />

                        <Translate
                            className="bet-table__data bet-table__data--false"
                            content="great_race.gr_bets.place_bets.bet_no" />

                        <FormattedAsset
                            amount={totalFalseBets}
                            asset={"1.3.0"}
                            decimalOffset={5}
                            hide_asset={deviceWidth > 576 ? false : true}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="cwd-btn__action-btn"
                    onClick={this.showBetModal.bind(this)}
                >
                    <Translate content="great_race.gr_bets.match_the_bet" />
                </button>

                {isModalVisible ?
                    <RatingBetModal
                        teamBetId={teamBetId}
                        selectedTeamName={teamName}
                        lowerRank={lowerRank}
                        upperRank={upperRank}
                        isModalVisible={isModalVisible}
                        closeBetModal={this.closeBetModal.bind(this)}
                        currentAccount={this.props.currentAccount}
                    />
                    : null}
            </div>
        );
    }
}

export { RatingBetItem, RatingBetItemMobile };