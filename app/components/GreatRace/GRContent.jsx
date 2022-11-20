import React from "react";
import Translate from "react-translate-component";
import SettingsStore from "stores/SettingsStore";
import NewIcon from "../NewIcon/NewIcon";
import { Tabs, Tab } from "../Utility/Tabs";
import RaceIndicatorWrap from "./gr-components/RaceIndicatorWrap";
import MyTeamWrap from "./gr-components/MyTeamWrap";
import GRInvitations from "./gr-components/GRInvitations";
import { ChainStore } from "bitsharesjs";
import { Apis } from "bitsharesjs-ws";
import ls from "common/localStorage";


let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");
let headerImg = require("assets/headers/great-race_header.jpg");

class GRContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentLocale: SettingsStore.getState().settings.get("locale"),
            invitationData: [],
            teamData: {},
            membersList: [],
            capData: {},
            intervalID: 0,
            showDownloadAlert: false
        };
    }

    componentDidMount() {
        this.getTeam(this.props.newTeam);
    }

    UNSAFE_componentWillReceiveProps(np) {
        this.getInvitations();
        if (this.props.currentAccount != np.currentAccount) {
            this.getTeam(np.currentAccount.get("gr_team"));

            this.setState({
                intervalID: setInterval(this.getTeam.bind(this), 5000)
            });
        }
        else if (np.newTeam != this.props.newTeam) {
            this.getTeam(np.newTeam);
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getInvitations() {
        let currentAccount = this.props.currentAccount.get("id");

        Apis.instance()
            .db_api()
            .exec("gr_get_invites", [currentAccount])
            .then(data => {
                this.setState({
                    invitationData: data
                });
            });
    }

    getTeam(currentAccountTeam) {
        if (currentAccountTeam) {
            Apis.instance()
                .db_api()
                .exec("get_objects", [[currentAccountTeam]])
                .then(data => {
                    this.setState({
                        teamData: data[0]
                    });
                    this.getAccounts();
                });
        }
    }

    getAccounts() {
        let teamData = this.state.teamData;

        Apis.instance()
            .db_api()
            .exec("get_full_accounts", [teamData["players"], false])
            .then(data => {
                this.setState({
                    membersList: data
                });
                Apis.instance()
                    .db_api()
                    .exec("get_full_accounts", [[teamData["captain"]], false])
                    .then(captain => {
                        this.setState({
                            capData: captain[0]
                        });
                    });
            });
    }

    downloadRules() {
        this.setState({
            showDownloadAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showDownloadAlert: false });
        }, 2000);
    }

    render() {
        let { currentLocale, invitationData, teamData, membersList, capData } = this.state;
        let { currentAccount, newTeam } = this.props;

        let dynGlobalObject = ChainStore.getObject("2.1.0");
        let currentStage = 1;
        let currentTime = "1970-01-01T00:00:00"
        let nextGrTime = "1970-01-01T00:00:00"
        if (dynGlobalObject) {
            currentStage = dynGlobalObject.get("current_gr_interval");
            currentTime = dynGlobalObject.get("time");
            nextGrTime = dynGlobalObject.get("next_gr_interval_time");
        }

        let isDisabled = ![1, 3, 5, 7, 8, 10, 12, 14].includes(currentStage);

        let canCreateTeam = false;

        let referralStatusType = currentAccount.get("referral_status_type")
        // let lastPeriodGr = currentAccount.get("last_period_gr")

        if (referralStatusType == 4 && currentStage == 1) {
            canCreateTeam = true
        }

        return (
            <div className="gr-index__wrap">
                <img className="gr-index__header" src={headerImg} alt="" />

                <div className="gr-index__center-layout">
                    <div className="gr-content__header">
                        <Translate
                            className="cwd-common__title-upper-case"
                            content="great_race.tab_title_gr"
                        />

                        <a
                            className="cwd-btn__action-btn gr-index__alert-btn"
                            href={
                                currentLocale == "ru" ?
                                    apiUrl + `/static/great_race_rules.pdf`
                                    :
                                    apiUrl + `/static/great_race_rules.pdf`
                            }
                            download
                            onClick={this.downloadRules.bind(this)}
                        >
                            <Translate content="great_race.download_rules_btn" />

                            <NewIcon
                                iconWidth={10}
                                iconHeight={11}
                                iconName={"icon_download"}
                            />

                            {this.state.showDownloadAlert ? (
                                <Translate
                                    className="gr-index__alert"
                                    content="actions.alerts.downloaded" />
                            ) : null}
                        </a>
                    </div>
                </div>

                <div>
                    <Tabs
                        className="cwd-tabs"
                        tabsClass=
                        {canCreateTeam || (Object.keys(teamData).length != 0) ||
                            (invitationData.length != 0) ?
                            "cwd-tabs__list"
                            : "cwd-tabs__list cwd-tabs__list--single-tab"}
                        contentClass="cwd-tabs__content"
                        segmented={false}
                        actionButtons={false}
                    >
                        <Tab title="great_race.tab_ratings">
                            <RaceIndicatorWrap
                                currentStage={currentStage}
                                currentAccount={currentAccount}
                                currentTime={currentTime}
                                nextGrTime={nextGrTime}
                            />
                        </Tab>

                        {canCreateTeam || Object.keys(teamData).length !== 0 ?
                            <Tab title="great_race.tab_my_team">
                                <MyTeamWrap
                                    newTeam={newTeam}
                                    currentAccount={currentAccount}
                                    currentStage={currentStage}
                                    teamData={teamData}
                                    membersList={membersList}
                                    capData={capData}
                                    canCreateTeam={canCreateTeam}
                                />
                            </Tab> : null
                        }

                        {invitationData.length == 0 || isDisabled ?
                            null :
                            <Tab
                                className="cwd-tabs__item-counter"
                                title="great_race.tab_invites"
                                counter={invitationData ? invitationData.length : null}
                            >
                                <GRInvitations
                                    currentAccount={currentAccount}
                                    invitationData={invitationData}
                                />
                            </Tab>}
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default GRContent;
