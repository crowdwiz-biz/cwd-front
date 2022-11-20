import React from "react";
import RatingTable from "./RatingTable";
import Translate from "react-translate-component";

class RatingTableMap extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let currentAccount = this.props.currentAccount;
        let userTeamPlace = this.props.userTeamPlace;

        let tableTop3 = this.props.tableTop3;
        let tableTop10 = this.props.tableTop10;
        let userTeamTable = this.props.userTeamTable;

        return (
            <section className="rating-table__wrap">
                <div className="rating-table__header">
                    <Translate content="great_race.rating.table_column_01" />
                    <Translate content="great_race.rating.table_column_02" />
                    <Translate content="great_race.rating.table_column_03" />
                </div>

                <div className="rating-table">
                    {tableTop3.map(item => (
                        <RatingTable
                            key={"top3_" + item.place_num}
                            teamId={item.team_id}
                            teamName={item.name}
                            placeNum={item.place_num}
                            logoImg={item.img}
                            players={item.players}
                            volume={item.volume}
                            currentAccount={currentAccount}
                        />
                    ))}
                </div>

                <div className="rating-table">
                    {tableTop10.map(item => (
                        <RatingTable
                            key={"top10_" + item.place_num}
                            teamId={item.team_id}
                            teamName={item.name}
                            placeNum={item.place_num}
                            logoImg={item.img}
                            players={item.players}
                            volume={item.volume}
                            currentAccount={currentAccount}
                        />
                    ))}
                </div>

                {userTeamPlace > 50 ? (
                    <div className="rating-table">
                        {userTeamTable.map(item => (
                            <RatingTable
                                key={"user_" + item.place_num} 
                                teamId={item.team_id}
                                teamName={item.name}
                                placeNum={item.place_num}
                                logoImg={item.img}
                                players={item.players}
                                volume={item.volume}
                                currentAccount={currentAccount}
                            />
                        ))}
                    </div>
                ) : null}
            </section>
        );
    }
}

export default RatingTableMap;
