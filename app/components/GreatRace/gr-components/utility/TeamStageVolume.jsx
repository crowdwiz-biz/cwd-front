import React from "react";
import Translate from "react-translate-component";
import FormattedAsset from "../../../Utility/FormattedAsset";
import NewIcon from "../../../NewIcon/NewIcon";


class TeamStageVolume extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let stageList = this.props.stageList;
        let totalVolume = 0;
        for (var item in stageList) {
            totalVolume = totalVolume + parseFloat(stageList[item]["volume"]);
        }
        let stageIndex = 1;

        return (
            <div className="gr-index__center-layout">
                <div className="team-stage-vol__wrap">
                    {/* GR STAGES */}
                    <ul className="team-stage-vol__list">
                        {stageList.map((item, index) => (
                            <li
                                key={index}
                                className={
                                    "team-stage-vol__item  team-stage-vol__item--" + item.isActive + "-stage"}>
                                <span className="team-stage-vol__name">{"Race " + stageIndex++}</span>

                                <span className="team-stage-vol__sum">
                                    <FormattedAsset
                                        amount={item.volume}
                                        asset={"1.3.0"}
                                        decimalOffset={5}
                                        hide_asset={false}
                                    />
                                </span>

                                {item.isActive == "past" ?
                                    <NewIcon
                                        iconClass="team-stage-vol__past-stage-icon"
                                        iconWidth={14}
                                        iconHeight={9}
                                        iconName={"icon_ok"}
                                    />
                                    : null}
                            </li>
                        ))}

                    </ul>

                    {/* TEAM TOTAL */}
                    <div className="team-stage-vol__item team-stage-vol__item--total">
                        <Translate
                            className="team-stage-vol__name"
                            content="great_race.my_team.total_volume" />

                        <span className="team-stage-vol__sum">
                            <FormattedAsset
                                amount={totalVolume}
                                asset={"1.3.0"}
                                decimalOffset={5}
                                hide_asset={false}
                            />
                        </span>

                    </div>
                </div>
            </div>
        );
    }
}

export default TeamStageVolume