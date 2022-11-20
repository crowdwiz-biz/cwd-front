import React from "react";
import {connect} from "alt-react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import AccountNameInput from "./../Forms/AccountNameInput";
import WalletDb from "stores/WalletDb";
import LoadingIndicator from "../LoadingIndicator";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {ChainStore, FetchChain, key} from "bitsharesjs";
import ReactTooltip from "react-tooltip";
import utils from "common/utils";
import SettingsActions from "actions/SettingsActions";
import WalletUnlockActions from "actions/WalletUnlockActions";
import NewIcon from "../NewIcon/NewIcon";
import CopyButton from "../Utility/CopyButton";
import {withRouter} from "react-router-dom";
import {scroller} from "react-scroll";
import {Notification, Tooltip} from "crowdwiz-ui-modal";
import AccountSelector from "../Account/AccountSelector";
import ls from "common/localStorage";

let accountStorage = new ls("__graphene__");

class CreateAccountPassword extends React.Component {
    constructor() {
        super();
        this.state = {
            validAccountName: false,
            account: null,
            accountName: "",
            referralAccount: "",
            accountNameRef: "",
            isReferralAccount: false,
            from_error: null,
            error: null,
            validPassword: false,
            registrar_account: null,
            loading: false,
            hide_refcode: true,
            show_identicon: false,
            step: 1,
            showPass: false,
            generatedPassword: ("P" + key.get_random_key().toWif()).substr(
                0,
                45
            ),
            confirm_password: "",
            showInputPass: "password",
            understand_1: false,
            understand_2: false,
            understand_3: false
        };

        this.account_input = React.createRef();
        this.scrollToInput = this.scrollToInput.bind(this);
        this.confirmCheckbox = this.confirmCheckbox.bind(this);
    }

    UNSAFE_componentWillMount() {
        if (!WalletDb.getWallet()) {
            SettingsActions.changeSetting({
                setting: "passwordLogin",
                value: true
            });
        }
    }

    componentDidMount() {
        ReactTooltip.rebuild();
        this.scrollToInput();

        if (AccountStore.getState().referralAccount) {
            this.setState({
                referralAccount: AccountStore.getState().referralAccount
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !utils.are_equal_shallow(nextState, this.state);
    }

    scrollToInput() {
        scroller.scrollTo(`scrollToInput`, {
            duration: 1500,
            delay: 100,
            smooth: true,
            containerId: "accountForm"
        });
    }

    isValid() {
        let firstAccount = AccountStore.getMyAccounts().length === 0;
        let valid = this.state.validAccountName;

        if (!WalletDb.getWallet()) {
            valid = valid && this.state.validPassword;
        }
        if (!firstAccount) {
            valid = valid && this.state.registrar_account;
        }
        return (
            valid &&
            this.state.understand_1 &&
            this.state.understand_2 &&
            this.state.understand_3
        );
    }

    onAccountNameChange(e) {
        const state = {};
        if (e.valid !== undefined) state.validAccountName = e.valid;
        if (e.value !== undefined) state.accountName = e.value;
        if (!this.state.show_identicon) state.show_identicon = true;
        this.setState(state);
    }

    _unlockAccount(name, password) {
        SettingsActions.changeSetting({
            setting: "passwordLogin",
            value: true
        });

        WalletDb.validatePassword(password, true, name);
        WalletUnlockActions.checkLock.defer();
    }

    createAccount(name, password) {
        let refcode = this.refs.refcode ? this.refs.refcode.value() : null;
        let referralAccount = accountStorage.get("referralAccount");
        this.setState({loading: true});

        AccountActions.createAccountWithPassword(
            name,
            password,
            this.state.registrar_account,
            referralAccount || this.state.registrar_account,
            0,
            refcode
        )
            .then(() => {
                AccountActions.setPasswordAccount(name);
                // Account registered by the faucet
                FetchChain("getAccount", name, undefined, {
                    [name]: true
                }).then(() => {
                    this.setState({
                        step: 2
                    });
                    this._unlockAccount(name, password);
                });
            })
            .catch(error => {
                console.log("ERROR AccountActions.createAccount", error);
                let error_msg =
                    error.base && error.base.length && error.base.length > 0
                        ? error.base[0]
                        : "unknown error";
                if (error.remote_ip) error_msg = error.remote_ip[0];

                Notification.error({
                    message: counterpart.translate(
                        "notifications.account_create_failure",
                        {
                            account_name: name,
                            error_msg: error_msg
                        }
                    )
                });

                this.setState({loading: false});
            });
    }

    onSubmit(e) {
        e.preventDefault();
        if (!this.isValid()) return;
        let account_name = this.accountNameInput.getValue();
        let password = this.state.generatedPassword;
        this.createAccount(account_name, password);
    }

    _onInput(value, e) {
        this.setState({
            [value]:
                value === "confirm_password"
                    ? e.target.value
                    : !this.state[value],
            validPassword:
                value === "confirm_password"
                    ? e.target.value === this.state.generatedPassword
                    : this.state.validPassword
        });
    }

    accountChanged(accountNameRef) {
        if (!accountNameRef) this.setState({account: null});
        this.setState({accountNameRef, error: null});
    }

    onAccountChanged(account) {
        this.setState({account, error: null, isReferralAccount: true});
        accountStorage.set("referralAccount", account.get("name"));
    }

    confirmCheckbox(is_checked, checkbox_id) {
        if (checkbox_id == 1) {
            this.setState({
                understand_1: !is_checked
            });
        } else if (checkbox_id == 2) {
            this.setState({
                understand_2: !is_checked
            });
        } else if (checkbox_id == 3) {
            this.setState({
                understand_3: !is_checked
            });
        } else {
            this.setState({
                understand_1: false,
                understand_2: false,
                understand_3: false
            });
        }
    }

    _renderAccountCreateForm() {
        let {registrar_account} = this.state;

        let my_accounts = AccountStore.getMyAccounts();
        let firstAccount = my_accounts.length === 0;
        let valid = this.isValid();
        let isLTM = false;
        let registrar = registrar_account
            ? ChainStore.getAccount(registrar_account)
            : null;
        if (registrar) {
            if (registrar.get("lifetime_referrer") == registrar.get("id")) {
                isLTM = true;
            }
        }

        let tabIndex = 1;

        return (
            <div>
                <form onSubmit={this.onSubmit.bind(this)} noValidate>
                    {/* {referralInput} */}

                    {this.state.referralAccount ? (
                        <section className="form__inner-group">
                            <div id="referralAccount">
                                <Translate
                                    content="wallet.user_referer"
                                    component="label"
                                    className="left-label"
                                />
                                <AccountSelector
                                    ref="account_input"
                                    accountName={this.state.referralAccount}
                                    onChange={this.accountChanged.bind(this)}
                                    onAccountChanged={this.onAccountChanged.bind(
                                        this
                                    )}
                                    account={this.state.referralAccount}
                                    error={this.state.from_error}
                                    tabIndex={tabIndex++}
                                    id="landingFormRefLogin"
                                />
                            </div>
                        </section>
                    ) : (
                        <section className="form__inner-group">
                            <div id="referralAccount">
                                <Translate
                                    content="wallet.user_referer"
                                    component="label"
                                    className="left-label"
                                />
                                <AccountSelector
                                    ref="account_input"
                                    accountName={this.state.accountNameRef}
                                    onChange={this.accountChanged.bind(this)}
                                    onAccountChanged={this.onAccountChanged.bind(
                                        this
                                    )}
                                    account={this.state.accountNameRef}
                                    error={this.state.from_error}
                                    tabIndex={tabIndex++}
                                    id="landingFormRefLogin"
                                />
                            </div>
                        </section>
                    )}

                    <section className="form__inner-group form__inner-group--acc-name">
                        <AccountNameInput
                            ref={ref => {
                                if (ref) {
                                    this.accountNameInput = ref.refs.nameInput;
                                }
                            }}
                            cheapNameOnly={!!firstAccount}
                            onChange={this.onAccountNameChange.bind(this)}
                            accountShouldNotExist={true}
                            placeholder={counterpart.translate(
                                "wallet.account_public"
                            )}
                            noLabel
                        />
                    </section>

                    <section className="form__inner-group">
                        <label className="left-label left-label--with-tooltip">
                            <Translate
                                content="wallet.generated"
                                className="left-label"
                            />
                            &nbsp;&nbsp;
                            <Tooltip
                                title={counterpart.translate(
                                    "tooltip.generate"
                                )}
                                unsafe
                            >
                                <span className="tooltip">
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"tips_icon"}
                                    />
                                </span>
                            </Tooltip>
                        </label>

                        <div className="form__copy-content-wrap">
                            <textarea
                                className="cwd-common__textarea"
                                rows="2"
                                readOnly
                                value={this.state.generatedPassword}
                                disabled
                            />

                            <div className="form__copy-btn">
                                <CopyButton
                                    text={this.state.generatedPassword}
                                    tip="tooltip.copy_password"
                                    dataPlace="top"
                                    className="form__copy-btn-inner"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <Translate
                            content="wallet.confirm_password"
                            className="left-label"
                            component="label"
                        />
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={this.state.confirm_password}
                            onChange={this._onInput.bind(
                                this,
                                "confirm_password"
                            )}
                            className="cwd-common__input"
                        />
                        {this.state.confirm_password &&
                        this.state.confirm_password !==
                            this.state.generatedPassword ? (
                            <div className="has-error">
                                <Translate content="wallet.confirm_error" />
                            </div>
                        ) : null}
                    </section>

                    <section className="form__checkbox-block">
                        <div className="form__confirm-wrap">
                            <label
                                className="cwd-common__checkbox-wrap"
                                htmlFor="checkbox-1"
                            >
                                <input
                                    type="checkbox"
                                    id="checkbox-1"
                                    className="cwd-common__checkbox"
                                    checked={this.state.understand_1}
                                    onChange={this.confirmCheckbox.bind(
                                        this,
                                        this.state.understand_1,
                                        1
                                    )}
                                />
                                <div className="cwd-common__agree-text">
                                    <Translate content="wallet.understand_1" />
                                </div>
                            </label>
                        </div>

                        <div className="form__confirm-wrap">
                            <label
                                className="cwd-common__checkbox-wrap"
                                htmlFor="checkbox-2"
                            >
                                <input
                                    type="checkbox"
                                    id="checkbox-2"
                                    className="cwd-common__checkbox"
                                    checked={this.state.understand_2}
                                    onChange={this.confirmCheckbox.bind(
                                        this,
                                        this.state.understand_2,
                                        2
                                    )}
                                />
                                <div className="cwd-common__agree-text">
                                    <Translate content="wallet.understand_2" />
                                </div>
                            </label>
                        </div>

                        <div className="form__confirm-wrap">
                            <label
                                htmlFor="checkbox-3"
                                className="cwd-common__checkbox-wrap"
                            >
                                <input
                                    type="checkbox"
                                    id="checkbox-3"
                                    className="cwd-common__checkbox"
                                    checked={this.state.understand_3}
                                    onChange={this.confirmCheckbox.bind(
                                        this,
                                        this.state.understand_3,
                                        3
                                    )}
                                />
                                <div className="cwd-common__agree-text">
                                    <Translate content="wallet.understand_3" />
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Submit button */}
                    <div className="account-creation__submit-wrap">
                        {this.state.loading ? (
                            <LoadingIndicator type="three-bounce" />
                        ) : (
                            <button
                                className="cwd-btn__rounded cwd-btn__rounded--confirm"
                                disabled={
                                    !valid || (registrar_account && !isLTM)
                                        ? true
                                        : false
                                }
                            >
                                <Translate content="account.create_account" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    _renderBackup() {
        return (
            <div className="backup-submit">
                <p className="account-creation-step-2__text">
                    <Translate unsafe content="wallet.password_crucial" />
                </p>

                <div className="gen-pass">
                    <label>
                        <Translate content="wallet.your_pass" />
                    </label>
                    <div className="gen-pass__input-wrap">
                        <div className="gen-pass__input-inner">
                            <input
                                type={this.state.showInputPass}
                                value={this.state.generatedPassword}
                                className="gen-pass__pass"
                            />
                            <div
                                onClick={e => this.showInputPass(e)}
                                className="gen-pass__show-pass"
                            >
                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"eye-pass"}
                                />
                            </div>
                        </div>
                        <CopyButton
                            text={this.state.generatedPassword}
                            tip="tooltip.copy_password"
                            dataPlace="top"
                            className="gen-pass__copy"
                        />
                    </div>
                </div>

                <p className="account-creation-step-2__text account-creation-step-2__text--warning">
                    <Translate unsafe content="wallet.password_lose_warning" />
                </p>

                <div className="account-creation__submit-wrap">
                    <Translate
                        onClick={() => {
                            this.props.history.push(
                                `/profile/${this.state.accountName}`
                            );
                        }}
                        className="cwd-btn__rounded cwd-btn__rounded--confirm"
                        content="wallet.ok_done"
                    />
                </div>
            </div>
        );
    }

    showInputPass() {
        if (this.state.showInputPass === "password") {
            this.setState({showInputPass: "text"});
        } else {
            this.setState({showInputPass: "password"});
        }
    }

    render() {
        let {step} = this.state;

        return (
            <div
                className="sub-content"
                id="scrollToInput"
                name="scrollToInput"
            >
                <div>
                    {step === 2 ? (
                        <div className="account-creation-step-2">
                            <div className="account-creation-step-2__step-wrap">
                                <Translate
                                    content="wallet.step"
                                    className="account-creation-step-2__step"
                                />

                                <span> 2</span>
                                <span className="account-creation-step-2__grey-span">
                                    /2
                                </span>
                            </div>

                            <Translate
                                content={"wallet.step_" + step + "_text"}
                                className="account-creation-step-2__title"
                            />
                        </div>
                    ) : null}

                    {step === 1 ? (
                        <div>{this._renderAccountCreateForm()}</div>
                    ) : (
                        this._renderBackup()
                    )}
                </div>
            </div>
        );
    }
}

CreateAccountPassword = withRouter(CreateAccountPassword);

export default connect(CreateAccountPassword, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {};
    }
});
