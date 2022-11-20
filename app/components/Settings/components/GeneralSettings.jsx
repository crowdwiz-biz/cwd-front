import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import { Collapse } from "react-bootstrap";
import counterpart from "counterpart";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";
import Switch from "react-switch";
import IntlActions from "actions/IntlActions";
import AccountActions from "actions/AccountActions";
import { ChainStore } from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import { connect } from "alt-react";

//STYLES
import "../scss/general-settings.scss";

class GeneralSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openVerification: true,
            openServiceAcc: true
        };
    }

    setVerificatonWord(e) {
        let myVerification = e.target.value;

        SettingsActions.changeSetting({
            setting: "verification",
            value: myVerification
        });
    }

    setWalletLockTimeout(e) {
        let userlockTimeout = e.target.value;

        SettingsActions.changeSetting({
            setting: "walletLockTimeout",
            value: userlockTimeout
        });
    }

    setCurrentLocale(e) {
        let newLocale = e.target.value;

        IntlActions.switchLocale(newLocale);
        SettingsActions.changeSetting({
            setting: "locale",
            value: newLocale
        });
    }

    setshowOrderSettles(showSettles, e) {
        let changeshowSettle = showSettles;

        SettingsActions.changeSetting({
            setting: "showSettles",
            value: changeshowSettle
        });
    }

    setCollapseVerification(openVerification) {
        this.setState({
            openVerification: openVerification
        });
    }

    setCollapseServiceAcc(openServiceAcc) {
        this.setState({
            openServiceAcc: openServiceAcc
        });
    }

    upgradeAccount(id, lifetime, e) {
        e.preventDefault();
        AccountActions.upgradeAccount(id, lifetime);
    }

    render() {
        let deviceWidth = window.innerWidth;
        let {
            verificationWord,
            lockTimeout,
            currentLocale,
            showSettles
        } = this.props;
        let locales = SettingsStore.getState().defaults.locale;

        let options = locales.map(locale => {
            let value = counterpart.translate("languages." + locale);

            return (
                <option key={locale} value={locale}>
                    {value}
                </option>
            );
        });

        let membership_expiration_date = false;
        if (this.props.account) {
            let account = this.props.account.toJS();
            membership_expiration_date = account.membership_expiration_date;

            if (
                membership_expiration_date === "1969-12-31T23:59:59" ||
                membership_expiration_date === "1970-01-01T00:00:00"
            )
                membership_expiration_date = false;
            else {
                membership_expiration_date = true;
            }
        }

        let accoiuntID;
        
        if(this.props.account) {
            accoiuntID = this.props.account.get("id");
        }
        else {
            accoiuntID = null;
        }
        

        return (
            <div className="app-settings__inner">
                <div className="general-settings__description-wrap">
                    <Collapse in={!this.state.openVerification}>
                        <div
                            className={
                                deviceWidth > 768
                                    ? "cwd-common__desc-block"
                                    : "cwd-common__desc-block cwd-common__desc-block--short-view"
                            }
                        >
                            <Translate
                                className="app-settings__description-text"
                                content="verification_word.description_text"
                            />
                        </div>
                    </Collapse>

                    {deviceWidth > 768 ? null : (
                        <button
                            onClick={this.setCollapseVerification.bind(
                                this,
                                !this.state.openVerification
                            )}
                            className="cwd-btn__show-more-btn noselect"
                        >
                            {this.state.openVerification ? (
                                <Translate content="proof_of_crowd.show_more_btn" />
                            ) : (
                                <Translate content="proof_of_crowd.hide_details_btn" />
                            )}

                            <NewIcon
                                iconClass={this.state.openVerification ? "" : "hide-arrow"}
                                iconWidth={15}
                                iconHeight={8}
                                iconName={"show_more_arrow"}
                            />
                        </button>
                    )}
                </div>

                <div className="general-settings__container">
                    {/* VERIFICATION WORD */}
                    <div className="general-settings__input-row">
                        <Translate
                            className="app-settings__common-text"
                            content="settings.verification"
                        />

                        <div className="general-settings__verifacation-inner">
                            <input
                                type="text"
                                className="app-settings__input"
                                value={verificationWord}
                                onChange={this.setVerificatonWord.bind(this)}
                                placeholder={counterpart.translate(
                                    "verification_word.none_verification_placeholder"
                                )}
                            />

                            <a
                                href="/"
                                className="app-settings__btn-wrap noselect"
                            >
                                <span className="app-settings__btn">
                                    <Translate content="verification_word.btn" />
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* LOCALE SELECTOR */}
                    <div className="general-settings__input-row">
                        <Translate
                            className="app-settings__common-text"
                            content="settings.locale"
                        />

                        <select
                            name="localeSelector"
                            value={currentLocale}
                            className="app-settings__input app-settings__input--select"
                            onChange={this.setCurrentLocale.bind(this)}
                        >
                            {options}
                        </select>
                    </div>

                    {/* ORDER SETLLE SWITCH */}
                    <div className="general-settings__switch-block">
                        <div className="general-settings__switch">
                            <Switch
                                onChange={this.handleChange}
                                checked={showSettles}
                                offColor={"#6d6d6d"}
                                onColor={"#141414"}
                                onHandleColor={"#DEC27F"}
                                checkedIcon={false}
                                uncheckedIcon={false}
                                height={20}
                                width={36}
                                borderRadius={20}
                                checkedHandleIcon={
                                    <NewIcon
                                        iconWidth={12}
                                        iconHeight={8}
                                        iconName={"checkmark"}
                                    />
                                }
                                onChange={this.setshowOrderSettles.bind(
                                    this,
                                    !showSettles
                                )}
                            />
                        </div>

                        <Translate
                            className="app-settings__common-text"
                            content="settings.showSettles"
                        />
                    </div>

                    {/* WALLET LOCK TIMEOUT */}
                    <div className="general-settings__input-row">
                        <Translate
                            className="app-settings__common-text"
                            content="settings.walletLockTimeout"
                        />

                        <input
                            type="number"
                            className="app-settings__input"
                            value={lockTimeout}
                            min="0"
                            onChange={this.setWalletLockTimeout.bind(this)}
                        />
                    </div>
                </div>

                {/* SERVICE ACCOUNT */}
                <div className="general-settings__description-wrap">
                    <Collapse in={!this.state.openServiceAcc}>
                        <div
                            className={
                                deviceWidth > 768
                                    ? "cwd-common__desc-block"
                                    : "cwd-common__desc-block cwd-common__desc-block--short-view"
                            }
                        >
                            <Translate
                                className="app-settings__description-text"
                                content="settings.service_acc_description"
                            />
                        </div>
                    </Collapse>

                    {deviceWidth > 768 ? null : (
                        <button
                            onClick={this.setCollapseServiceAcc.bind(
                                this,
                                !this.state.openServiceAcc
                            )}
                            className="cwd-btn__show-more-btn noselect"
                        >
                            {this.state.openServiceAcc ? (
                                <Translate content="proof_of_crowd.show_more_btn" />
                            ) : (
                                <Translate content="proof_of_crowd.hide_details_btn" />
                            )}

                            <NewIcon
                                iconClass={this.state.openServiceAcc ? "" : "hide-arrow"}
                                iconWidth={15}
                                iconHeight={8}
                                iconName={"show_more_arrow"}
                            />
                        </button>
                    )}
                </div>

                <div className="general-settings__container">
                    <div className="general-settings__input-row">
                        <Translate
                            className="app-settings__common-text"
                            content="settings.service_account"
                        />

                        {!membership_expiration_date ?
                            <button
                                type="button"
                                className="app-settings__btn app-settings__btn--activate noselect"
                                onClick={this.upgradeAccount.bind(
                                    this,
                                    accoiuntID,
                                    true
                                )}
                            >
                                <Translate content="settings.activate_btn" />
                            </button>
                            :
                            <span className="app-settings__option-stutus app-settings__option-stutus--success">
                                <Translate content="settings.option_activated" />

                                <NewIcon
                                    iconWidth={14}
                                    iconHeight={9}
                                    iconName={"icon_ok"}
                                />
                            </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

GeneralSettings = connect(GeneralSettings, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().currentAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount
                ),
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                passwordAccount: AccountStore.getState().passwordAccount
            };
        } else {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                passwordAccount: AccountStore.getState().passwordAccount
            };
        }
    }
});

export default GeneralSettings;
