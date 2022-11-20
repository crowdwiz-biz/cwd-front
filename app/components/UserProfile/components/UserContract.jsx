import React from "react";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import { Link } from "react-router-dom";
import TranslateWithLinks from "../../Utility/TranslateWithLinks";


// CONTRACT ICONS
let start = require("assets/svg-images/svg-common/contracts-icons/start.svg");
let expert = require("assets/svg-images/svg-common/contracts-icons/expert.svg");
let citizen = require("assets/svg-images/svg-common/contracts-icons/citizen.svg");
let infinity = require("assets/svg-images/svg-common/contracts-icons/infinity.svg");
let client = require("assets/svg-images/svg-common/contracts-icons/client.svg");

class UserContract extends React.Component {
    constructor(props) {
        super(props);
    }

    isWalletLocked() {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.upgradeAccountContract();
                })
                .catch(() => { });
        } else {
            this.upgradeAccountContract();
        }
    }

    upgradeAccountContract() {
        let referalStatus = this.props.referalStatus;
        let currentAccount = this.props.accountId;

        AccountActions.upgradeStatusAccount(currentAccount, referalStatus);
    }

    render() {
        let { referalStatus, notMyAccount, accountName } = this.props;
        let userContractImg;

        if (referalStatus == 0) {
            userContractImg = <img className="user-contract__icon" src={client} />;
        }
        if (referalStatus == 1) {
            userContractImg = <img className="user-contract__icon" src={start} />;
        }
        if (referalStatus == 2) {
            userContractImg = <img className="user-contract__icon" src={expert} />;
        }
        if (referalStatus == 3) {
            userContractImg = <img className="user-contract__icon" src={citizen} />;
        }
        if (referalStatus == 4) {
            userContractImg = <img className="user-contract__icon" src={infinity} />;
        }

        let contractName = ["Client", "Start", "Expert", "Citizen", "Infinity"];

        let contractExpirationDateRaw = this.props.contractExpirationDate

        if (contractExpirationDateRaw) {
            var myStdate = new Date(contractExpirationDateRaw + "Z");
            var statusExpirationDate = myStdate.toLocaleString();
        }

        return (
            <section className="user-contract__wrap">
                <Translate
                    className="cwd-common__subtitle"
                    content="user_profile.contract_title"
                />

                <div className={referalStatus == 0 ?
                    "user-contract__inner user-contract__inner--no-contract"
                    : "user-contract__inner"
                }>
                    {/* ICON & TITLE */}
                    <div className="user-contract__data-wrap">
                        {userContractImg}

                        <span className="user-contract__text">
                            {contractName[referalStatus]}
                        </span>
                    </div>

                    {/* EXPIRATION DATE */}
                    {referalStatus == 0 ?
                        <div className="user-contract__expiration-block">
                            <span className="cwd-common__text">
                                <TranslateWithLinks
                                    string="user_profile.no_contract_text"
                                    keys={[
                                        {
                                            type: "account",
                                            value: accountName,
                                            arg: "account"
                                        }
                                    ]}
                                />
                            </span>
                        </div>
                        :
                        <div className="user-contract__expiration-block">
                            <Translate
                                className="user-contract__label"
                                content="user_profile.expiration_date"
                            />
                            <span className="user-contract__text">
                                {statusExpirationDate}&nbsp;(GMT)
                            </span>
                        </div>
                    }

                    {/* BTN BLOCK */}
                    {!notMyAccount ?
                        referalStatus == 0 ?
                            <div className="user-contract__btn-wrap user-contract__btn-wrap--no-contract">
                                <Link
                                    to={"/contracts-overview"}
                                    className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                                >
                                    <Translate content="user_profile.choose_btn" />
                                </Link>
                            </div>
                            :
                            <div className="user-contract__btn-wrap">
                                <button
                                    type="button"
                                    className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                                    onClick={this.isWalletLocked.bind(this)}
                                >
                                    <Translate content="user_profile.extend_btn" />
                                </button>

                                <Link
                                    to={"/contracts-overview"}
                                    className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                                >
                                    {referalStatus == 4 ?
                                        <Translate content="user_profile.overview_btn" />
                                        :
                                        <Translate content="user_profile.change_btn" />

                                    }
                                </Link>
                            </div>
                        : null}
                </div>
            </section>
        );
    }
}

export default UserContract;