import React from "react";
import NewIcon from "../../../NewIcon/NewIcon";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import ReactTooltip from "react-tooltip";

let currentStageName = [
    counterpart.translate("great_race.stage_name.waiting"),
    counterpart.translate("great_race.stage_name.start"),
    counterpart.translate("great_race.stage_name.race_1"),
    counterpart.translate("great_race.stage_name.rest_1"),
    counterpart.translate("great_race.stage_name.race_2"),
    counterpart.translate("great_race.stage_name.rest_2"),
    counterpart.translate("great_race.stage_name.race_3"),
    counterpart.translate("great_race.stage_name.finish_1"),
    counterpart.translate("great_race.stage_name.rest_3"),
    counterpart.translate("great_race.stage_name.race_4"),
    counterpart.translate("great_race.stage_name.rest_4"),
    counterpart.translate("great_race.stage_name.race_5"),
    counterpart.translate("great_race.stage_name.rest_5"),
    counterpart.translate("great_race.stage_name.race_6"),
    counterpart.translate("great_race.stage_name.finish_2"),
];

class RaceIndicatorDesktop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            place: "right",
            type: "dark",
            effect: "solid",
            condition: false,
            border: false
        };
    }

    render() {
        const { place, type, effect, border } = this.state;

        return (
            <div className="gr-index__center-layout">
                <div className="gr-indicator__wrap">
                    <div className="gr-indicator__header">
                        <div className="gr-indicator__column">
                            <Translate
                                className={
                                    this.props.currentStage <= 7
                                        ? "gr-indicator__stage-name gr-indicator__stage-name--active"
                                        : "gr-indicator__stage-name"
                                }
                                content="great_race.first_stage"
                                data-for="Stage1"
                                data-tip={counterpart.translate(
                                    "great_race.tooltip_stage1"
                                )}
                                data-iscapture="true"
                            />

                            {this.props.currentStage <= 7 ? (
                                <NewIcon
                                    iconClass={"breadcrumbs_arrow"}
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"header_breadcrumbs_arrow"}
                                />
                            ) : null}

                            {this.props.currentStage <= 7 ? (
                                <span className="gr-indicator__stage-name gr-indicator__stage-name--white">
                                    <Translate
                                        className="gr-indicator__stage-name gr-indicator__stage-name--white"
                                        content="great_race.rating.interval"
                                    />
                                &nbsp;
                                    <span> {currentStageName[this.props.currentStage]}</span>
                                </span>
                            ) : null}
                        </div>

                        <div className="gr-indicator__column">
                            <Translate
                                className={
                                    this.props.currentStage > 7
                                        ? "gr-indicator__stage-name gr-indicator__stage-name--active"
                                        : "gr-indicator__stage-name"
                                }
                                content="great_race.second_stage"
                                data-for="Stage2"
                                data-tip={counterpart.translate(
                                    "great_race.tooltip_stage2"
                                )}
                                data-iscapture="true"
                            />

                            {this.props.currentStage > 7 ? (
                                <NewIcon
                                    iconClass={"breadcrumbs_arrow"}
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"header_breadcrumbs_arrow"}
                                />
                            ) : null}

                            {this.props.currentStage > 7 ? (
                                <span className="gr-indicator__stage-name gr-indicator__stage-name--white">
                                    <Translate
                                        className="gr-indicator__stage-name gr-indicator__stage-name--white"
                                        content="great_race.rating.interval"
                                    />
                                    &nbsp;
                                    <span> {currentStageName[this.props.currentStage]}</span>
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="gr-indicator__body">
                        <div className="gr-indicator__base"></div>
                        <div
                            className="gr-indicator__line"
                            style={{ width: this.props.currentPointStage + "px" }}
                        ></div>
                        <span
                            className="gr-indicator__stage-point"
                            style={{
                                left: this.props.currentPointStage - 10 + "px"
                            }}
                        ></span>
                    </div>


                    {this.props.daysLeft == 0 ?
                        <div className="gr-indicator__days-wrap">
                            <Translate content="great_race.rating.last_day" />
                        </div>
                        :
                        <div className="gr-indicator__days-wrap">
                            <Translate content="great_race.rating.days_left" />
                            {":"}&nbsp;
                            <span>{this.props.daysLeft}</span>
                        </div>}
                </div>

                {/* TOOLTIPS */}
                <ReactTooltip
                    id="Stage1"
                    place={place}
                    type={type}
                    effect={effect}
                    border={border}
                />
                <ReactTooltip
                    id="Stage2"
                    place={place}
                    type={type}
                    effect={effect}
                    border={border}
                />
            </div>
        );
    }
}

class RaceIndicatorMobile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            place: "right",
            type: "dark",
            effect: "solid",
            condition: false,
            border: false
        };
    }

    render() {
        const { place, type, effect, border } = this.state;

        return (
            <div className="gr-index__center-layout">
                <div className="gr-indicator__wrap">
                    <div className="gr-indicator__header">
                        <div className="gr-indicator__column">
                            {this.props.currentStage <= 7 ? (
                                <Translate
                                    className="gr-indicator__stage-name gr-indicator__stage-name--active"
                                    content="great_race.first_stage"
                                    data-for="Stage1"
                                    data-tip={counterpart.translate(
                                        "great_race.tooltip_stage1"
                                    )}
                                    data-iscapture="true"
                                />
                            ) : (
                                <Translate
                                    className="gr-indicator__stage-name gr-indicator__stage-name--active"
                                    content="great_race.second_stage"
                                    data-for="Stage2"
                                    data-tip={counterpart.translate(
                                        "great_race.tooltip_stage2"
                                    )}
                                    data-iscapture="true"
                                />
                            )}
                            <NewIcon
                                iconClass={"breadcrumbs_arrow"}
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"header_breadcrumbs_arrow"}
                            />
                            <Translate
                                className="gr-indicator__stage-name gr-indicator__stage-name--white"
                                content="great_race.rating.interval"
                            />
                            &nbsp;
                            <span className="gr-indicator__stage-name gr-indicator__stage-name--active">
                                {currentStageName[this.props.currentStage]}
                            </span>
                        </div>
                    </div>

                    <div className="gr-indicator__body">
                        <div className="gr-indicator__base"></div>
                        <div
                            className="gr-indicator__line"
                            style={{
                                width: this.props.currentPointInterval + "px"
                            }}
                        ></div>
                        <span
                            className="gr-indicator__stage-point"
                            style={{
                                left:
                                    this.props.currentPointInterval - 10 + "px"
                            }}
                        ></span>
                    </div>

                    {this.props.daysLeft == 0 ?
                        <div className="gr-indicator__days-wrap">
                            <Translate content="great_race.rating.last_day" />
                        </div>
                        :
                        <div className="gr-indicator__days-wrap">
                            <Translate content="great_race.rating.days_left" />
                            {":"}&nbsp;
                            <span>{this.props.daysLeft}</span>
                        </div>}
                </div>

                {/* TOOLTIPS */}
                <ReactTooltip
                    id="Stage1"
                    place={place}
                    type={type}
                    effect={effect}
                    border={border}
                />
                <ReactTooltip
                    id="Stage2"
                    place={place}
                    type={type}
                    effect={effect}
                    border={border}
                />
            </div>
        );
    }
}

export { RaceIndicatorDesktop, RaceIndicatorMobile };
