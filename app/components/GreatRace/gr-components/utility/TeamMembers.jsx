import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import FormattedAsset from "../../../Utility/FormattedAsset";
import LinkToAccountById from "../../../Utility/LinkToAccountById";
import AccountSelector from "../../../Account/AccountSelector";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";


class TeamMembers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            memberName: "",
            memberNameObj: {},
        };
    }

    showInviteModal() {
        this,
            this.setState({
                isModalVisible: true
            });
    }

    closeInviteModal() {
        this.setState({
            isModalVisible: false
        });
    }

    onAccountChange(memberName) {
        this.setState({
            memberName: memberName
        });
    }

    onAccountChangeObj(memberName) {
        this.setState({
            memberNameObj: memberName
        });
    }

    removeTeamMember(player) {
        let currentAccount = this.props.currentAccount;
        let captain = currentAccount.get("id");
        let team = currentAccount.get("gr_team");

        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    AccountActions.removePlayer(captain, player, team);
                })
                .catch(() => { });
        } else {
            AccountActions.removePlayer(captain, player, team);
        }
    }

    leaveTeam(captain) {
        let player = this.props.currentAccount.get("id");
        let team = this.props.currentAccount.get("gr_team");

        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    AccountActions.leaveTeam(captain, player, team);
                })
                .catch(() => { });
        } else {
            AccountActions.leaveTeam(captain, player, team);
        }
    }

    isWalletLocked(userId) {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.inviteTeamMember();
                })
                .catch(() => { });
        } else {
            this.inviteTeamMember();
        }
    }

    inviteTeamMember() {
        let captain = this.props.capData[1]["account"]["id"];
        let player = this.state.memberNameObj.get("id");
        let team = this.props.teamId;

        AccountActions.grInviteSend(captain, player, team);

        this.closeInviteModal();
    }

    render() {
        let deviceWidth = window.innerWidth;
        let { capData, membersList, isCaptain, currentStage } = this.props;
        let contracts = ["Client", "Start", "Expert", "Citizen", "infinity"];

        let isModalVisible = this.state.isModalVisible;
        let isDisabled = ![1, 3, 5, 7, 8, 10, 12, 14].includes(currentStage);

        let team = this.props.teamId;
        let myTeam = this.props.currentAccount.get("gr_team");

        let isMyTeam = false;

        if (team == myTeam) {
            isMyTeam = true;
        }

        return (
            <div className="team-members__wrap">
                {/* HEADER */}
                <div className="team-members__table-header">
                    <Translate content="great_race.my_team.member_login" />
                    <Translate content="great_race.my_team.user_contract" />
                    <Translate content="great_race.my_team.user_volume" />
                </div>

                {/* TABLE */}
                <div className={isCaptain ?
                    "team-members__row"
                    :
                    "team-members__row team-members__row--overview-mode"
                }>
                    <div className="team-members__name-wrap">
                        <LinkToAccountById
                            className="team-members__text team-members__text--cap"
                            account={capData[0]}
                        />

                        <NewIcon
                            iconClass="team-members__cap-icon"
                            iconWidth={20}
                            iconHeight={22}
                            iconName={"great-race_icon_captain"}
                        />
                    </div>

                    <span className="team-members__text">Infinity</span>

                    <span className="team-members__text team-members__text--volume">
                        <FormattedAsset
                            amount={capData[1]["statistics"]["current_period_gr"]}
                            asset={"1.3.0"}
                            decimalOffset={5}
                            hide_asset={deviceWidth > 576 ? false : true}
                        />
                    </span>
                </div>

                {/* TEAM MEMBERS */}
                <div className="team-members__table">
                    {membersList.map(user => (
                        <div
                            className={isCaptain ?
                                "team-members__row"
                                :
                                "team-members__row team-members__row--overview-mode"
                            }
                            key={user[0]}>
                            <div className="team-members__name-wrap">
                                <LinkToAccountById
                                    className="team-members__text team-members__text--cap"
                                    account={user[0]}
                                />
                            </div>

                            <span className="team-members__text">
                                {contracts[user[1]["account"]["referral_status_type"]]}
                            </span>

                            <span className="team-members__text team-members__text--volume">
                                <FormattedAsset
                                    amount={[user[1]["statistics"]["current_period_gr"]]}
                                    asset={"1.3.0"}
                                    decimalOffset={5}
                                    hide_asset={deviceWidth > 576 ? false : true}
                                />
                            </span>

                            {isCaptain ?
                                <button
                                    className="team-members__remove-btn"
                                    disabled={isDisabled}
                                    onClick={this.removeTeamMember.bind(this, user[0])}
                                >
                                    <NewIcon
                                        iconWidth={30}
                                        iconHeight={30}
                                        iconName={"btn_remove"}
                                    />
                                </button>

                                : null}
                        </div>
                    ))}
                </div>

                <div className="team-members__modal-btn-wrap">

                    {isMyTeam && isCaptain ?
                        <button
                            className="cwd-btn__square-btn noselect"
                            onClick={this.showInviteModal.bind(this)}
                            disabled={membersList.length < 11 && !isDisabled ? false : true}
                        >
                            <Translate content="great_race.my_team.ivite_user_btn" />
                        </button>
                        : null}
                    {(isMyTeam && !isCaptain) ?
                        <button
                            className="cwd-btn__action-btn cwd-btn__action-btn--delete-btn team-members__leave-btn noselect"
                            onClick={this.leaveTeam.bind(this, capData[0])}
                            disabled={isDisabled}
                        >
                            <NewIcon
                                iconWidth={10}
                                iconHeight={11}
                                iconName={"icon_delete-btn"}
                            />

                            <Translate content="great_race.my_team.leave_team_btn" />
                        </button> :
                        null
                    }
                </div>

                {isModalVisible ? (
                    <div className="team-members__modal">
                        <div>
                            <div className="crowd-modal__wrap">
                                <Translate
                                    className="crowd-modal__modal-title"
                                    content="great_race.my_team.modal_ivite_title"
                                />

                                <NewIcon
                                    iconClass={"crowd-modal__close-modal-btn"}
                                    iconWidth={40}
                                    iconHeight={40}
                                    iconName={"close_modal"}
                                    onClick={this.closeInviteModal.bind(this)}
                                />

                                <div className="team-modal__row-wrap">
                                    <AccountSelector
                                        account={this.state.memberName}
                                        accountName={this.state.memberName}
                                        onChange={this.onAccountChange.bind(this)}
                                        onAccountChanged={this.onAccountChangeObj.bind(this)}
                                        typeahead={true}
                                        tabIndex={0}
                                        hideImage
                                    />

                                    <button
                                        className="cwd-btn__square-btn"
                                        onClick={this.isWalletLocked.bind(this, this.state.memberName)}
                                    >
                                        <Translate content="great_race.my_team.invite_submit_btn" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="crowd-modal__overlay"
                            id="grOverlay"
                        ></div>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default TeamMembers;
