import React from "react";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import AccountSelector from "../../../Account/AccountSelector";


class ChangeRefModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            referrerName: "",
            referrerNameObj: {},
            isDisabled: true
        }
    }


    onAccountChange(referrerName) {
        this.setState({
            referrerName: referrerName
        });
    }

    onAccountChangeObj(referrerName) {
        let referrerNameId = referrerName.get("id");
        let accountId = this.props.accountId;

        if (referrerNameId != accountId) {
            this.setState({
                referrerNameObj: referrerName,
                isDisabled: false
            });
        }
    }

    isWalletLocked() {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.changwRefSubmit();
                })
                .catch(() => { });
        } else {
            this.changwRefSubmit();
        }
    }

    changwRefSubmit() {
        let referrerNameId = this.state.referrerNameObj.get("id");
        let accountId = this.props.accountId;

        if (referrerNameId != accountId) {
            AccountActions.changeReferrer(accountId, referrerNameId);
        }

        this.props.closeRefModal();
    }

    render() {
        let isDisabled = this.state.isDisabled;

        return (
            <div className="main-user-data__modal">
                <div>
                    <div className="crowd-modal__wrap">
                        <Translate
                            className="crowd-modal__modal-title"
                            content="user_profile.change_referrer_title"
                        />

                        <NewIcon
                            iconClass={"crowd-modal__close-modal-btn"}
                            iconWidth={40}
                            iconHeight={40}
                            iconName={"close_modal"}
                            onClick={this.props.closeRefModal}
                        />

                        <div>
                            <AccountSelector
                                account={this.state.referrerName}
                                accountName={this.state.referrerName}
                                onChange={this.onAccountChange.bind(this)}
                                onAccountChanged={this.onAccountChangeObj.bind(this)}
                                typeahead={true}
                                tabIndex={0}
                                hideImage
                            />

                            <button
                                className="cwd-btn__square-btn"
                                onClick={this.isWalletLocked.bind(this)}
                                disabled={isDisabled}
                            >
                                <Translate content="user_profile.change_btn" />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className="crowd-modal__overlay"
                    id="grOverlay"
                ></div>
            </div>
        );
    }
}

export default ChangeRefModal;