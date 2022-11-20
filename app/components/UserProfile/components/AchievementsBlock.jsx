import React from "react";
import Translate from "react-translate-component";
import { Link } from "react-router-dom";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

let grHeader = require("assets/png-images/user-profile/gr_header.png");
let dexHeader = require("assets/png-images/user-profile/dex_header.png");
let scoopHeader = require("assets/png-images/user-profile/scoop_header.png");

class AchievementsBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { userRank,
            isApostol,
            userDex,
            userScoop,
            grTeamId,
            grTeamName,
            teamLogo
        } = this.props;
        
        let rankingList = [
            "Start",
            "Iron",
            "Bronze",
            "Silver",
            "Gold",
            "Platinum",
            "Diamond",
            "Master",
            "Elite"
        ];
        let rankingImgClass = "achieve-block__rank-icon--" + userRank;

        let isGRBlockShown;

        if (!isApostol && grTeamName == "" && userRank == 0) {
            isGRBlockShown = false
        }
        else {
            isGRBlockShown = true
        }

        return (
            <section className="achieve-block">
                <Translate
                    className="cwd-common__subtitle"
                    content="user_profile.achievments.title" />

                <div className={isGRBlockShown ? " achieve-block__wrap--has-team achieve-block__wrap" : "achieve-block__wrap"}>

                    {/* GREAT RACE */}
                    {isGRBlockShown ?
                        <div className="achieve-block__gr-wrap">
                            <img className="achieve-block__gr-header" src={grHeader} alt="Great Race" />

                            <div className="achieve-block__gr-columns">

                                {/* TEAM */}
                                {grTeamName ?
                                    <Link
                                        className="achieve-block__col"
                                        to={"/great-race/team-" + grTeamId}>

                                        <span
                                            className="achieve-block__icon"
                                            style={{
                                                backgroundImage: `url(${teamLogo})`
                                            }}
                                            style={{
                                                backgroundImage: `url(${teamLogo.replace(
                                                    /http+[a-zA-Z0-9.:/]+ipfs/g,
                                                    apiUrl + "/ipfs"
                                                )})`
                                            }}
                                            
                                            ></span>

                                        <div className="achieve-block__text-wrap">
                                            <Translate
                                                className="achieve-block__label"
                                                content="user_profile.achievments.team" />

                                            <span className={isApostol ?
                                                "achieve-block__text achieve-block__text--team-name" :
                                                "achieve-block__text achieve-block__text--team-name achieve-block__text--full-width"
                                            }>
                                                {grTeamName}
                                            </span>
                                        </div>
                                    </Link>
                                    :
                                    <div className="achieve-block__col">
                                        <span
                                            className="achieve-block__icon"
                                            style={{
                                                backgroundImage: `url(${teamLogo})`
                                            }}></span>

                                        <div className="achieve-block__text-wrap">
                                            <Translate
                                                className="achieve-block__label"
                                                content="user_profile.achievments.team" />

                                            <Translate
                                                className="achieve-block__text achieve-block__text--team-name "
                                                content="user_profile.achievments.no_team" />
                                        </div>
                                    </div>}


                                {/* RANKING */}
                                <div className="achieve-block__col">
                                    <span
                                        className={
                                            "achieve-block__icon achieve-block__rank-icon " +
                                            rankingImgClass
                                        }></span>

                                    <div className="achieve-block__text-wrap">
                                        <Translate
                                            className="achieve-block__label"
                                            content="user_profile.achievments.ranking" />

                                        <span className="achieve-block__text">
                                            {rankingList[userRank]}
                                        </span>
                                    </div>
                                </div>

                                {/* APOSTOL */}
                                {isApostol ?
                                    <div className="achieve-block__col">
                                        <span
                                            className="achieve-block__icon achieve-block__apostol"></span>

                                        <div className="achieve-block__text-wrap">
                                            <Translate
                                                className="achieve-block__label"
                                                content="user_profile.achievments.grade" />

                                            <Translate
                                                className="achieve-block__text"
                                                content="user_profile.achievments.grade_title" />
                                        </div>
                                    </div>
                                    : null}
                            </div>
                        </div>
                        : null}

                    <div className={isGRBlockShown ? "achieve-block__rating-wrap" : "achieve-block__rating-wrap achieve-block__rating-wrap--full-width"}>

                        {/* CWDex */}
                        <div className="achieve-block__side-rating">
                            <img className="achieve-block__rating-img" src={dexHeader} alt="CWDex" />

                            <div className="achieve-block__rating-block">
                                <Translate
                                    className="achieve-block__label"
                                    content="user_profile.achievments.rating" />

                                <span className="achieve-block__num">
                                    {userDex}
                                </span>
                            </div>
                        </div>

                        {/* GAME SCOOP */}
                        <div className="achieve-block__side-rating">
                            <img className="achieve-block__rating-img" src={scoopHeader} alt="Game Scoop" />

                            <div className="achieve-block__rating-block">
                                <Translate
                                    className="achieve-block__label"
                                    content="user_profile.achievments.rating" />

                                <span className="achieve-block__num">
                                    {userScoop}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        );
    }
}

export default AchievementsBlock;