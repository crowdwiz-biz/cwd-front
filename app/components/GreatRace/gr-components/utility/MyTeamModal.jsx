import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

class MyTeamModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teamLogo: "",
            isLogoLoaded: false,
            isModalVisible: false,
            isDisabled: true
        };
    }

    showTeamModal() {
        this,
            this.setState({
                isModalVisible: true
            });
    }

    closeTeamModal() {
        this.setState({
            isModalVisible: false
        });
    }

    removeTeamLogo() {
        this.setState({
            teamLogo: "",
            isLogoLoaded: false
        });

        this.formValidate();
    }

    uploadTeamLogo() {
        let file = document.getElementById("teamLogoBtn");
        let formData = new FormData();

        formData.append("file0", file.files[0]);

        let fetchUrl = apiUrl + "/upload_scoop";

        fetch(fetchUrl, {
            method: "POST",
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    teamLogo: apiUrl + "/ipfs/" + data,
                    isLogoLoaded: true
                });

                this.formValidate();
            })
            .catch(error => console.log(error));
    }

    formValidate() {
        let teamTitle = document.getElementById("teamTitle").value;
        let teamDescription = document.getElementById("teamDescription").value;
        let teamLogo = this.state.teamLogo;

        if (
            teamTitle.length <= 64 &&
            teamTitle.length >= 4 &&
            teamDescription.length <= 256 &&
            teamDescription.length > 0 &&
            teamLogo.length > 0
        ) {
            this.setState({
                isDisabled: false
            });
        } else {
            this.setState({
                isDisabled: true
            });
        }

    }

    isWalletLocked(e) {
        e.preventDefault();
        if (this.props.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.submitCreateTeam();
                    })
                    .catch(() => { });
            } else {
                this.submitCreateTeam();
            }
        }
    }

    submitCreateTeam() {
        let currentAccount = this.props.currentAccount;
        let accountId = currentAccount.get("id");

        let teamTitle = document.getElementById("teamTitle").value;
        let teamDescription = document.getElementById("teamDescription").value;
        let teamLogo = this.state.teamLogo;

        AccountActions.grTeamCreate(accountId, teamTitle, teamDescription, teamLogo);

        this.closeTeamModal();
    }

    render() {
        let { teamLogo, isLogoLoaded, isModalVisible } = this.state;

        return (
            <div className="gr-index__center-layout">
                <Translate
                    className="gr-content__description-text"
                    content="great_race.my_team.my_team_intro"
                    component="p"
                />

                <button
                    className="cwd-btn__square-btn"
                    onClick={this.showTeamModal.bind(this)}
                >
                    <Translate content="great_race.my_team.create_btn" />

                    <NewIcon
                        iconClass={"my-team-wrap__btn-plus"}
                        iconWidth={13}
                        iconHeight={13}
                        iconName={"icon_plus"}
                    />
                </button>

                {isModalVisible ? (
                    <div className="my-team-modal">
                        <div>
                            <div className="crowd-modal__wrap">
                                <Translate
                                    className="crowd-modal__modal-title"
                                    content="great_race.my_team.modal_title"
                                />

                                <NewIcon
                                    iconClass={"crowd-modal__close-modal-btn"}
                                    iconWidth={40}
                                    iconHeight={40}
                                    iconName={"close_modal"}
                                    onClick={this.closeTeamModal.bind(this)}
                                />

                                <div className="my-team-modal__row">
                                    <Translate
                                        className="crowd-modal__label"
                                        content="great_race.my_team.team_name"
                                    />

                                    <input
                                        className="cwd-common__input"
                                        type="text"
                                        name="teamTitle"
                                        id="teamTitle"
                                        placeholder={counterpart.translate(
                                            "great_race.my_team.title_placeholder"
                                        )}
                                        maxLength="64"
                                        autoComplete="off"
                                        onChange={this.formValidate.bind(this)}
                                    />
                                </div>

                                <div className="my-team-modal__row my-team-modal__row--margin-bottom">
                                    <Translate
                                        className="crowd-modal__label"
                                        content="great_race.my_team.team_description"
                                    />

                                    <div>
                                        <textarea
                                            className="cwd-common__textarea"
                                            name="teamDescription"
                                            id="teamDescription"
                                            rows="3"
                                            placeholder={counterpart.translate(
                                                "great_race.my_team.description_placeholder"
                                            )}
                                            onChange={this.formValidate.bind(
                                                this
                                            )}
                                            maxLength="135"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="my-team-modal__row">
                                    <Translate
                                        className="crowd-modal__label"
                                        content="great_race.my_team.team_logo"
                                    />

                                    {isLogoLoaded ? (
                                        <div className="my-team-modal__row-inner my-team-modal__row-inner--3-cols">
                                            <span
                                                className="my-team-modal__logo-preview"
                                                style={{
                                                    backgroundImage: `url(${teamLogo})`
                                                }}
                                            ></span>

                                            <Translate
                                                className="crowd-modal__higthlight-text"
                                                content="great_race.my_team.logo_uploaded"
                                            />

                                            <NewIcon
                                                iconClass={
                                                    "my-team-modal__remove-btn"
                                                }
                                                iconWidth={30}
                                                iconHeight={30}
                                                iconName={"btn_remove"}
                                                onClick={this.removeTeamLogo.bind(
                                                    this
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <div className="my-team-modal__row-inner">
                                            <label
                                                className="cwd-common__upload"
                                                type="button"
                                                htmlFor="teamLogoBtn"
                                            >
                                                <input
                                                    ref="teamLogoBtn"
                                                    id="teamLogoBtn"
                                                    type="file"
                                                    name="uploadBtn"
                                                    onChange={this.uploadTeamLogo.bind(
                                                        this
                                                    )}
                                                />

                                                <NewIcon
                                                    iconClass={
                                                        "my-team-modal__upload-btn"
                                                    }
                                                    iconWidth={15}
                                                    iconHeight={15}
                                                    iconName={"icon_plus"}
                                                />
                                            </label>

                                            <Translate
                                                className="crowd-modal__info-text"
                                                content="great_race.my_team.logo_text"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="my-team-modal__footer">
                                    <button
                                        className="cwd-btn__square-btn"
                                        type="button"
                                        disabled={this.state.isDisabled}
                                        onClick={this.isWalletLocked.bind(this)}
                                    >
                                        <Translate
                                            className="my-team-modal__info-text"
                                            content="great_race.my_team.create_submit_btn"
                                        />
                                    </button>

                                    <Translate
                                        className="crowd-modal__info-text"
                                        content="great_race.my_team.team_info"
                                        unsafe
                                    />
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

export default MyTeamModal;
