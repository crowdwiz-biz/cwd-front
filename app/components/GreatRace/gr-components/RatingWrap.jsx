import React from "react";
import Translate from "react-translate-component";
import RatingTableMap from "./utility/RatingTableMap";
import { Apis } from "bitsharesjs-ws";


class RatingWrap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableData: []
        };
    }

    UNSAFE_componentWillMount() {
        Apis.instance()
        .db_api()
        .exec("gr_get_rating", ["race"])
        .then(ratingData => {
            this.setState({
                tableData: ratingData
            });
        });
    }
    

    getTableData(interval, btnId) {

        let elems = document.getElementsByClassName("gr-rating__table-btn");

        for (var i = 0; i < elems.length; i++) {
            elems[i].classList.remove("gr-rating__table-btn--active");
        }

        document.getElementById(btnId).classList.add("gr-rating__table-btn--active");

        Apis.instance()
            .db_api()
            .exec("gr_get_rating", [interval])
            .then(ratingData => {
                this.setState({
                    tableData: ratingData
                });
            });

        
    }

    render() {
        let tableData = this.state.tableData;
        let currentAccount = this.props.currentAccount;
        let userTeamPlace;
        let userTeam;

        for (var team in tableData){
            if (tableData[team]["team_id"] == currentAccount.get("gr_team")) {
                userTeamPlace=tableData[team]["place_num"];
                userTeam=tableData[team];
            }
        }


        let tableTop3 = tableData.slice(0, 3);
        let tableTop10 = tableData.slice(3, 50);
        let userTeamTable = [userTeam];

        let btnData = [
            { tableAPI: "race" },
            { tableAPI: "stage" },
            { tableAPI: "current_interval" },
            { tableAPI: "prev_interval" }
        ];

        let ApiBtnBlock = btnData.map((item, index) => {
            return (
                <button
                    key={"btn" + index}
                    className={
                        index == 0
                            ? "gr-rating__table-btn gr-rating__table-btn--active noselect"
                            : "gr-rating__table-btn noselect"
                    }
                    id={"tableBtn0" + index}
                    onClick={this.getTableData.bind(
                        this,
                        item.tableAPI,
                        "tableBtn0" + index
                    )}
                >
                    <Translate content={"great_race.rating.btn_0" + index} />
                </button>
            );
        });
        if (tableData.length>0) {
        return (
            <div className="gr-content__full-width-wrap">
                <div className="gr-index__center-layout">
                    <Translate
                        className="cwd-common__subtitle"
                        content="great_race.rating.title"
                    />

                    <div className="gr-rating__btn-wrap">{ApiBtnBlock}</div>
                </div>

                <div>
                    <RatingTableMap
                        tableData={tableData}
                        currentAccount={currentAccount}
                        userTeamPlace={userTeamPlace}
                        tableTop3={tableTop3}
                        tableTop10={tableTop10}
                        userTeamTable={userTeamTable}
                    />
                </div>
            </div>
        );
        }
        else {
            return null;
        }
    }
}

export default RatingWrap;
