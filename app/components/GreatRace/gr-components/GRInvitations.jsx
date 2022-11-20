import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import AccountActions from "actions/AccountActions";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";


class GRInvitations extends React.Component {
    constructor(props) {
        super(props);
    }

    isWalletLocked(captain, teamId, gr_invite) {
        let currentAccountId = this.props.currentAccount.get("id");

        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    AccountActions.acceptInvitation(captain, currentAccountId, teamId, gr_invite);
                })
                .catch(() => { });
        } else {
            AccountActions.acceptInvitation(captain, currentAccountId, teamId, gr_invite);
        }
    }

    render() {
        let deviceWidth = window.innerWidth;
        let invitationData = this.props.invitationData;

        return (
            <section className="gr-invite__wrap">
                <div className="gr-index__center-layout">

                    {invitationData.map(item => (
                        <div className="gr-invite__item" key={item["team"]["id"]}>
                            <div className="gr-invite__col">
                                <Translate
                                    className="gr-invite__text"
                                    content="great_race.invites.ivite_text_01" />
                                <span className="gr-invite__text gr-invite__text--highlight">
                                    <LinkToAccountById account={item["team"]["captain"]} />
                                </span>
                                <Translate
                                    className="gr-invite__text"
                                    content="great_race.invites.ivite_text_02" />
                                <span className="gr-invite__text gr-invite__text--highlight">{item["team"]["name"]}</span>
                            </div>

                            <div className="gr-invite__btn-block">
                                {deviceWidth > 576 ?
                                    <button
                                        type="button"
                                        className="gr-invite__btn"
                                        onClick={this.isWalletLocked.bind(
                                            this,
                                            item["team"]["captain"],
                                            item["team"]["id"],
                                            item["gr_invite"]
                                        )}
                                    >
                                        <NewIcon
                                            iconWidth={30}
                                            iconHeight={30}
                                            iconName={"btn_accept"}
                                        />
                                    </button>
                                    :
                                    <button
                                        type="button"
                                        className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                                        onClick={this.isWalletLocked.bind(
                                            this,
                                            item["team"]["captain"],
                                            item["team"]["id"],
                                            item["gr_invite"])}
                                    >
                                        <Translate
                                            content="great_race.invites.accept_invite" />
                                    </button>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }
}

export default GRInvitations