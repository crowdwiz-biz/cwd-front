import React from "react";
import FormattedAsset from "../../../Utility/FormattedAsset";
import {Link} from "react-router-dom";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");


class RatingTable extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let deviceWidth = window.innerWidth;

        let teamId = this.props.teamId;
        let teamName = this.props.teamName;
        let placeNum = this.props.placeNum;
        let logoImg = this.props.logoImg;
        let players = this.props.players;
        let volume = this.props.volume;
        let userTeam = this.props.currentAccount.get("gr_team");

        return (
            <div
                className={
                    userTeam == teamId
                        ? "rating-table__row rating-table__row--user-team"
                        : "rating-table__row"
                }
            >
                <div className="rating-table__row-inner">
                    <span
                        className={
                            "rating-table__num rating-table__num--" +
                            placeNum
                        }
                    >
                        <span>{placeNum}</span>
                    </span>

                    <span
                        className="rating-table__logo"
                        style={{
                            backgroundImage: `url(${logoImg.replace(
                                /http+[a-zA-Z0-9.:/]+ipfs/g,
                                apiUrl + "/ipfs"
                            )})`
                        }}
                    ></span>
                </div>

                <Link
                    className="rating-table__data rating-table__data--team-title"
                    to={"/great-race/team-" + teamId}
                >
                    {teamName}
                </Link>

                <span className="rating-table__data">
                    {players}
                </span>

                <span
                    className={
                        userTeam == teamId
                            ? "rating-table__data rating-table__data--user-volume"
                            : "rating-table__data"
                    }
                >
                    <FormattedAsset
                        amount={volume}
                        asset={"1.3.0"}
                        decimalOffset={5}
                        hide_asset={deviceWidth > 576 ? false : true}
                    />
                </span>
            </div>
        );
    }
}

export default RatingTable;
