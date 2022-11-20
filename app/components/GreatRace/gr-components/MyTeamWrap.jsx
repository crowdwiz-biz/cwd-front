import React from "react";
import MyTeamModal from "./utility/MyTeamModal";
import GRTeamOverview from "./utility/GRTeamOverview";
import Translate from "react-translate-component";


class MyTeamWrap extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { membersList,
            capData,
            intervalID,
            currentAccount,
            teamData,
            currentStage,
            newTeam,
            canCreateTeam
        } = this.props;

        return (
            <section className="my-team-wrap">
                {newTeam ?
                    <GRTeamOverview
                        currentAccount={currentAccount}
                        currentStage={currentStage}
                        membersList={membersList}
                        capData={capData}
                        intervalID={intervalID}
                        currentAccount={currentAccount}
                        teamData={teamData}
                    />
                    :
                    canCreateTeam && currentStage == 1 ?
                        <MyTeamModal
                            currentAccount={currentAccount}
                            currentStage={currentStage}
                        />
                        :
                        <div className="gr-index__center-layout">
                            <Translate
                                className="gr-content__info-text"
                                content="great_race.my_team.non_create_text" />
                        </div>
                }
            </section>
        );
    }
}

export default MyTeamWrap;
