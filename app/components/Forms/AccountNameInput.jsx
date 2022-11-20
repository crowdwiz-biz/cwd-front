import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import {ChainValidation} from "bitsharesjs";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import AltContainer from "alt-container";

class AccountNameInput extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        initial_value: PropTypes.string,
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
        accountShouldExist: PropTypes.bool,
        accountShouldNotExist: PropTypes.bool,
        cheapNameOnly: PropTypes.bool,
        noLabel: PropTypes.bool
    };

    static defaultProps = {
        noLabel: false
    };

    constructor() {
        super();
        this.state = {
            value: null,
            error: null,
            existing_account: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextState.value !== this.state.value ||
            nextState.error !== this.state.error ||
            nextState.account_name !== this.state.account_name ||
            nextState.existing_account !== this.state.existing_account ||
            nextProps.searchAccounts !== this.props.searchAccounts
        );
    }

    componentDidUpdate() {
        if (this.props.onChange) this.props.onChange({valid: !this.getError()});
    }

    getValue() {
        return this.state.value;
    }

    setValue(value) {
        this.setState({value});
    }

    clear() {
        this.setState({account_name: null, error: null, warning: null});
    }

    focus() {
        this.refs.input.focus();
    }

    valid() {
        return !this.getError();
    }

    getError() {
        if (this.state.value === null) return null;
        let error = null;
        if (this.state.error) {
            error = this.state.error;
        } else if (
            this.props.accountShouldExist ||
            this.props.accountShouldNotExist
        ) {
            let account = this.props.searchAccounts.find(
                a => a === this.state.value
            );
            if (this.props.accountShouldNotExist && account) {
                error = counterpart.translate(
                    "account.name_input.name_is_taken"
                );
            }
            if (this.props.accountShouldExist && !account) {
                error = counterpart.translate("account.name_input.not_found");
            }
        }
        return error;
    }

    is_empty(value) {
        return value == null || value.length === 0;
    }

    is_empty_user_input(value, allow_too_short) {
        var i, label, len, length, ref, suffix;
        if (allow_too_short == null) {
            allow_too_short = false;
        }
        suffix = counterpart.translate(
            "account.name_input.account_name_should"
        );
        if (this.is_empty(value)) {
            return (
                suffix +
                counterpart.translate("account.name_input.not_be_empty")
            );
        }
        length = value.length;
        if (!allow_too_short && length < 3) {
            return (
                suffix + counterpart.translate("account.name_input.be_longer")
            );
        }
        if (length > 63) {
            return (
                suffix + counterpart.translate("account.name_input.be_shorter")
            );
        }
        if (/\./.test(value)) {
            suffix = counterpart.translate(
                "account.name_input.each_account_segment_should"
            );
        }
        ref = value.split(".");
        for (i = 0, len = ref.length; i < len; i++) {
            label = ref[i];
            if (!/^[~a-z]/.test(label)) {
                return (
                    suffix +
                    counterpart.translate(
                        "account.name_input.start_with_a_letter"
                    )
                );
            }
            if (!/^[~a-z0-9-]*$/.test(label)) {
                return (
                    suffix +
                    counterpart.translate("have_only_letters_digits_or_dashes")
                );
            }
            if (/--/.test(label)) {
                return (
                    suffix +
                    counterpart.translate(
                        "account.name_input.have_only_one_dash_in_a_row"
                    )
                );
            }
            if (!/[a-z0-9]$/.test(label)) {
                return (
                    suffix +
                    counterpart.translate(
                        "account.name_input.end_with_a_letter_or_digit"
                    )
                );
            }
            if (!(label.length >= 3)) {
                return (
                    suffix +
                    counterpart.translate("account.name_input.be_longer")
                );
            }
        }
        return null;
    }

    validateAccountName(value) {
        this.state.error =
            value === ""
                ? counterpart.translate(
                      "account.name_input.please_enter_valid_account_name"
                  )
                : this.is_empty_user_input(value);

        this.state.warning = null;
        if (this.props.cheapNameOnly) {
            if (!this.state.error && !ChainValidation.is_cheap_name(value)) {
                this.state.error = counterpart.translate(
                    "account.name_input.premium_name_faucet"
                );
            }
            if (value.length < 5) {
                this.state.error = counterpart.translate(
                    "account.name_input.login_length"
                );
            }
        } else {
            if (!this.state.error && !ChainValidation.is_cheap_name(value))
                this.state.warning = counterpart.translate(
                    "account.name_input.premium_name_warning"
                );
        }
        this.setState({
            value: value,
            error: this.state.error,
            warning: this.state.warning
        });
        if (this.props.onChange)
            this.props.onChange({value: value, valid: !this.getError()});
        if (this.props.accountShouldExist || this.props.accountShouldNotExist)
            AccountActions.accountSearch(value);
    }

    handleChange(e) {
        e.preventDefault();
        e.stopPropagation();
        // Simplify the rules (prevent typing of invalid characters)
        var account_name = e.target.value.toLowerCase();
        account_name = account_name.match(/[a-z0-9\.-]+/);
        account_name = account_name ? account_name[0] : "";
        this.setState({account_name});
        this.validateAccountName(account_name);
    }

    onKeyDown(e) {
        if (this.props.onEnter && event.keyCode === 13) this.props.onEnter(e);
    }

    render() {
        let error = <span>{this.getError() || ""}</span>;
        let class_name = classNames("cwd-common__form-group", "account-name", {
            "has-error": false
        });
        let warning = this.state.warning;
        // let {noLabel} = this.props;

        return (
            <div className={class_name}>
                {/* {noLabel ? null : <label><Translate content="account.name" /></label>} */}
                <section>
                    <label className="left-label">
                        {this.props.placeholder}
                    </label>
                    <input
                        name="username"
                        className="cwd-common__input"
                        type="text"
                        ref="input"
                        autoComplete="username"
                        placeholder={null}
                        maxlength="39"
                        onChange={this.handleChange}
                        onKeyDown={this.onKeyDown}
                        value={
                            this.state.account_name || this.props.initial_value
                        }
                    />
                </section>
                <div className="facolor-error">{error}</div>
                <div className="facolor-warning">{error ? null : warning}</div>
            </div>
        );
    }
}

export default class StoreWrapper extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[AccountStore]}
                inject={{
                    searchAccounts: () => {
                        return AccountStore.getState().searchAccounts;
                    }
                }}
            >
                <AccountNameInput ref="nameInput" {...this.props} />
            </AltContainer>
        );
    }
}
