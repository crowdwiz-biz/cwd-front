import React from "react";
import PasswordInput from "./../Forms/PasswordInput";
import WalletDb from "stores/WalletDb";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {key} from "bitsharesjs";

export default class AccountPermissionsMigrate extends React.Component {
    constructor() {
        super();
        this.state = {
            validPassword: false,
            pass: null,
            generatedPassword:
                "P" +
                key
                    .get_random_key()
                    .toWif()
                    .toString()
        };
    }

    onSubmit() {}

    onPasswordChange(e) {
        let {valid} = e;
        let name = this.props.account.get("name");

        const active = !valid
            ? null
            : WalletDb.generateKeyFromPassword(name, "active", e.value).pubKey;
        const owner = !valid
            ? null
            : WalletDb.generateKeyFromPassword(name, "owner", e.value).pubKey;
        const memo = !valid
            ? null
            : WalletDb.generateKeyFromPassword(name, "memo", e.value).pubKey;
        this.setState({validPassword: e.valid, pass: e.value});
        this.props.onSetPasswordKeys({active, owner, memo});
    }

    checkKeyUse(key, role) {
        if (!key) return false;
        if (role === "memo") {
            return key === this.props.memoKey;
        } else {
            return this.props[`${role}Keys`].reduce((a, b) => {
                return b === key || a;
            }, false);
        }
    }

    _onUseKey(role, remove = false) {
        if (remove) {
            this.props[role === "active" ? "onRemoveActive" : "onRemoveOwner"](
                this.props[role],
                "_keys"
            );
        } else if (this.props[role]) {
            const weights = {
                active: this.props.account.getIn([
                    "active",
                    "weight_threshold"
                ]),
                owner: this.props.account.getIn(["owner", "weight_threshold"])
            };
            this.props[
                role === "active"
                    ? "onAddActive"
                    : role === "owner"
                    ? "onAddOwner"
                    : "onSetMemo"
            ](this.props[role], weights[role]);
        }
    }

    render() {
        let activeInUse = this.checkKeyUse(
            this.props.active && this.props.active,
            "active"
        );
        let ownerInUse = this.checkKeyUse(
            this.props.owner && this.props.owner,
            "owner"
        );
        let memoInUse = this.checkKeyUse(
            this.props.memo && this.props.memo,
            "memo"
        );

        let useText = counterpart.translate("account.perm.use_text");
        let removeText = counterpart.translate("account.perm.remove_text");

        return (
            <div>
                <p style={{maxWidth: "800px"}} className="permissions__text">
                    <Translate content="account.perm.password_model_1" />
                </p>

                <p style={{maxWidth: "800px"}} className="permissions__text">
                    <Translate content="wallet.password_model_1" />
                </p>
                <p style={{maxWidth: "800px"}} className="permissions__text">
                    <Translate unsafe content="wallet.password_model_2" />
                </p>

                <div className="divider" />

                <form
                    className="permissions__form"
                    onSubmit={this.onSubmit.bind(this)}
                    noValidate
                >
                    <label className="left-label permissions__label">
                        <Translate content="wallet.generated" />
                    </label>
                    <p className="permissions__gen-pass">
                        {this.state.generatedPassword}
                    </p>

                    <p>
                        <Translate
                            content="account.perm.password_model_2"
                            className="permissions__text"
                        />
                    </p>
                    <PasswordInput
                        ref="password"
                        confirmation={true}
                        onChange={this.onPasswordChange.bind(this)}
                        noLabel
                        passwordLength={12}
                        checkStrength
                    />
                </form>

                <div className="table permissions__table">
                    <div>
                        <div className={activeInUse ? "in-use" : ""}>
                            <div className="permissions__new-key-text">
                                <Translate content="account.perm.new_active" />:
                            </div>

                            <div className="permissions__new-key-wrap">
                                <div className="permissions__new-key">
                                    {this.props.active}
                                </div>
                                <div>
                                    <div
                                        className="permissions__model-btn"
                                        onClick={this._onUseKey.bind(
                                            this,
                                            "active",
                                            activeInUse
                                        )}
                                    >
                                        {activeInUse ? removeText : useText}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={ownerInUse ? "in-use" : ""}>
                            <div className="permissions__new-key-text">
                                <Translate content="account.perm.new_owner" />:
                            </div>

                            <div className="permissions__new-key-wrap">
                                <div className="permissions__new-key">
                                    {this.props.owner}
                                </div>
                                <div>
                                    <div
                                        className="permissions__model-btn"
                                        onClick={this._onUseKey.bind(
                                            this,
                                            "owner",
                                            ownerInUse
                                        )}
                                    >
                                        {ownerInUse ? removeText : useText}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={memoInUse ? "in-use" : ""}>
                            <div className="permissions__new-key-text">
                                <Translate content="account.perm.new_memo" />:
                            </div>

                            <div className="permissions__new-key-wrap">
                                <div className="permissions__new-key">
                                    {this.props.memo}
                                </div>
                                <div>
                                    <div
                                        className="permissions__model-btn"
                                        style={{
                                            visibility: memoInUse
                                                ? "hidden"
                                                : ""
                                        }}
                                        onClick={this._onUseKey.bind(
                                            this,
                                            "memo",
                                            memoInUse
                                        )}
                                    >
                                        {useText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {memoInUse ? (
                    <p
                        style={{maxWidth: "800px", paddingTop: 10}}
                        className="has-error"
                    >
                        <Translate content="account.perm.memo_warning" />
                    </p>
                ) : null}
            </div>
        );
    }
}
