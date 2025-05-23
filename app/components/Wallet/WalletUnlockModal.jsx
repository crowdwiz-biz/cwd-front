import React from "react";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import AltContainer from "alt-container";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletManagerStore from "stores/WalletManagerStore";
import BackupStore from "stores/BackupStore";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletActions from "actions/WalletActions";
import BackupActions, {restore, backup} from "actions/BackupActions";
import AccountActions from "actions/AccountActions";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import {
    Modal,
    Button,
    Form,
    Input,
    Switch,
    InputNumber,
    Tooltip,
    Notification
} from "crowdwiz-ui-modal";
import utils from "common/utils";
import AccountSelector from "../Account/AccountSelectorAnt";
import {PrivateKey} from "bitsharesjs";
import {saveAs} from "file-saver";
import counterpart from "counterpart";
import {backupName} from "common/backupUtils";
import {withRouter} from "react-router-dom";
import {setLocalStorageType, isPersistantType} from "lib/common/localStorage";
import Translate from "react-translate-component";
import ls from "common/localStorage";

let ss = new ls("__graphene__");

import "./scss/auth-modal.scss";

class WalletUnlockModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState(props);
        this.account_input = React.createRef();

        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    initialState = (props = this.props) => {
        const {passwordAccount, currentWallet} = props;
        return {
            isModalVisible: false,
            passwordError: null,
            accountName: passwordAccount,
            walletSelected: !!currentWallet,
            customError: null,
            isOpen: false,
            restoringBackup: false,
            stopAskingForBackup: false,
            rememberMe: WalletUnlockStore.getState().rememberMe,
            focusedOnce: false,
            isAutoLockVisible: false
        };
    };

    UNSAFE_componentWillReceiveProps(np) {
        const {walletSelected, restoringBackup, accountName} = this.state;
        const {
            currentWallet: newCurrentWallet,
            passwordAccount: newPasswordAccount
        } = np;

        const newState = {};
        // Updating the accountname through the listener breaks UX (#2335)
        if (walletSelected && !restoringBackup && !newCurrentWallet)
            newState.walletSelected = false;
        if (this.props.passwordLogin != np.passwordLogin) {
            newState.passwordError = false;
            newState.customError = null;
        }

        this.setState(newState);
    }

    shouldComponentUpdate(np, ns) {
        if (this.state.isOpen && !ns.isOpen) return false;
        return (
            !utils.are_equal_shallow(np, this.props) ||
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value
        });
    }

    handleModalClose = () => {
        WalletUnlockActions.cancel();
        BackupActions.reset();
        this.setState(this.initialState());
    };

    handleModalOpen = () => {
        BackupActions.reset();
        this.setState({isOpen: true}, () => {
            const {passwordLogin} = this.props;
            if (!passwordLogin) {
                const {password_input} = this.refs;
                if (password_input) {
                    password_input.clear();
                    password_input.focus();
                }

                const {dbWallet} = this.props;
                if (
                    dbWallet &&
                    Apis.instance().chain_id !== dbWallet.chain_id
                ) {
                    Notification.error({
                        message: counterpart.translate(
                            "notifications.wallet_unlock_different_block_chain",
                            {
                                expectedWalletId: dbWallet.chain_id
                                    .substring(0, 4)
                                    .toUpperCase(),
                                actualWalletId: Apis.instance()
                                    .chain_id.substring(0, 4)
                                    .toUpperCase()
                            }
                        )
                    });
                    WalletUnlockActions.cancel();
                }
            }
        });
    };

    componentDidMount() {
        const {modalId} = this.props;
        ZfApi.subscribe(modalId, (name, msg) => {
            const {isOpen} = this.state;

            if (name !== modalId) return;
            if (msg === "close" && isOpen) {
                this.handleModalClose();
            } else if (msg === "open" && !isOpen) {
                this.handleModalOpen();
            }
        });
    }

    componentDidUpdate() {
        const {resolve, isLocked, passwordLogin} = this.props;
        const {isModalVisible, accountName, focusedOnce} = this.state;

        if (!focusedOnce && isModalVisible && passwordLogin) {
            let account_input =
                this.account_input && this.account_input.current;
            let password_input = this.password_input;

            if (!account_input || !password_input) {
                this.forceUpdate();
            }
            if (accountName && password_input) {
                password_input.input.focus();
                this.setState({focusedOnce: true});
            } else if (
                account_input &&
                account_input.input &&
                typeof account_input.focus === "function"
            ) {
                account_input.focus();
                this.setState({focusedOnce: true});
            }
        } else if (!focusedOnce && isModalVisible && !passwordLogin) {
            let password_input = this.password_input2;
            if (!password_input) {
                this.forceUpdate();
            }
            if (password_input) {
                password_input.input.focus();
                this.setState({focusedOnce: true});
            }
        }

        if (resolve) {
            if (isLocked) {
                this.setState({
                    isModalVisible: true
                });
            } else {
                resolve();
            }
        } else {
            this.setState({
                isModalVisible: false,
                password: ""
            });
        }
    }

    validate = (password, account) => {
        const {passwordLogin, resolve} = this.props;
        const {stopAskingForBackup} = this.state;

        const {cloudMode} = WalletDb.validatePassword(
            password || "",
            true, //unlock
            account
        );

        if (WalletDb.isLocked()) {
            this.setState({passwordError: true});
        } else {
            if (!passwordLogin) {
                this.setState({
                    password: ""
                });
            } else {
                this.setState({
                    password: ""
                });
                if (cloudMode) AccountActions.setPasswordAccount(account);
            }
            WalletUnlockActions.change();
            if (stopAskingForBackup) WalletActions.setBackupDate();
            else if (this.shouldUseBackupLogin()) this.backup();
            resolve();
            WalletUnlockActions.cancel();
        }
    };

    passwordInput = () =>
        this.refs.password_input ||
        this.refs.custom_password_input.refs.password_input;

    restoreBackup = (password, callback) => {
        const {backup} = this.props;
        const privateKey = PrivateKey.fromSeed(password || "");
        const walletName = backup.name.split(".")[0];
        restore(privateKey.toWif(), backup.contents, walletName)
            .then(() => {
                return WalletActions.setWallet(walletName)
                    .then(() => {
                        BackupActions.reset();
                        callback();
                    })
                    .catch(e => this.setState({customError: e.message}));
            })
            .catch(e => {
                const message = typeof e === "string" ? e : e.message;
                const invalidBackupPassword =
                    message === "invalid_decryption_key";
                this.setState({
                    customError: invalidBackupPassword ? null : message,
                    passwordError: invalidBackupPassword
                });
            });
    };

    handleLogin = e => {
        if (e) e.preventDefault();

        const {passwordLogin, backup} = this.props;
        const {walletSelected, accountName} = this.state;

        if (!passwordLogin && !walletSelected) {
            this.setState({
                customError: counterpart.translate(
                    "wallet.ask_to_select_wallet"
                )
            });
        } else {
            this.setState({passwordError: null}, () => {
                const password = this.state.password;
                if (!passwordLogin && backup.name) {
                    this.restoreBackup(password, () => this.validate(password));
                } else {
                    if (!this.state.rememberMe) {
                        if (isPersistantType()) {
                            // setLocalStorageType("inram");
                            setLocalStorageType("persistant");
                        }
                    } else {
                        if (!isPersistantType()) {
                            setLocalStorageType("persistant");
                        }
                    }
                    const account = passwordLogin ? accountName : null;
                    this.validate(password, account);
                }
            });
        }
    };

    closeRedirect = path => {
        WalletUnlockActions.cancel();
        this.props.history.push(path);
    };

    handleCreateWallet = () => this.closeRedirect("/create-account/wallet");

    handleRestoreOther = () => this.closeRedirect("/settings/restore");

    loadBackup = e => {
        const fullPath = e.target.value;
        const file = e.target.files[0];

        this.setState({restoringBackup: true}, () => {
            const startIndex =
                fullPath.indexOf("\\") >= 0
                    ? fullPath.lastIndexOf("\\")
                    : fullPath.lastIndexOf("/");
            let filename = fullPath.substring(startIndex);
            if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
                filename = filename.substring(1);
            }
            BackupActions.incommingWebFile(file);
            this.setState({
                walletSelected: true
            });
        });
    };

    handleSelectedWalletChange = e => {
        const {value} = e.target;
        const selectionType = value.split(".")[0];
        const walletName = value.substring(value.indexOf(".") + 1);

        BackupActions.reset();
        if (selectionType === "upload")
            this.setState({
                restoringBackup: true,
                customError: null
            });
        else
            WalletActions.setWallet(walletName).then(() =>
                this.setState({
                    walletSelected: true,
                    customError: null,
                    restoringBackup: false
                })
            );
    };

    backup = () =>
        backup(this.props.dbWallet.password_pubkey).then(contents => {
            const {currentWallet} = this.props;
            const name = backupName(currentWallet);
            BackupActions.incommingBuffer({name, contents});

            const {backup} = this.props;
            let blob = new Blob([backup.contents], {
                type: "application/octet-stream; charset=us-ascii"
            });
            if (blob.size !== backup.size)
                throw new Error("Invalid backup to download conversion");
            saveAs(blob, name);
            WalletActions.setBackupDate();
            BackupActions.reset();
        });

    handleAskForBackupChange = e =>
        this.setState({stopAskingForBackup: e.target.checked});

    handleUseOtherWallet = () => {
        this.setState({
            walletSelected: false,
            restoringBackup: false,
            passwordError: null,
            customError: null
        });
    };

    handleAccountNameChange = accountName =>
        this.setState({accountName, error: null});

    shouldShowBackupWarning = () =>
        !this.props.passwordLogin &&
        this.state.walletSelected &&
        !this.state.restoringBackup &&
        !(!!this.props.dbWallet && !!this.props.dbWallet.backup_date);

    shouldUseBackupLogin = () =>
        this.shouldShowBackupWarning() && !this.state.stopAskingForBackup;

    handleRememberMe = () => {
        let newRememberMe = !this.state.rememberMe;
        this.setState({rememberMe: newRememberMe});
        SettingsActions.changeSetting({
            setting: "rememberMe",
            value: newRememberMe
        });
    };

    handleWalletAutoLock = val => {
        let newValue = parseInt(val, 10);
        if (isNaN(newValue)) newValue = 0;
        if (!isNaN(newValue) && typeof newValue === "number") {
            SettingsActions.changeSetting({
                setting: "walletLockTimeout",
                value: newValue
            });
        }
    };

    render() {
        let apiUrl = ss.get("serviceApi");

        let hostName = apiUrl.slice(8);

        const {passwordLogin, modalId, walletLockTimeout} = this.props;
        const {passwordError, accountName} = this.state;

        let footer = [];
        let index = 1;
        let verificationWord = SettingsStore.getState().settings.get(
            "verification"
        );

        if (passwordLogin) {
            footer.push(
                <div className="login-modal__footer" key={index++}>
                    <div key="wallet.backup_login">
                        <Button
                            className="login-modal__btn"
                            onClick={this.handleLogin}
                            key="login-btn"
                        >
                            {counterpart.translate(
                                this.shouldUseBackupLogin()
                                    ? "wallet.backup_login"
                                    : "header.unlock_short"
                            )}
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            // U N L O C K
            <Modal
                visible={this.state.isModalVisible}
                wrapClassName={"unlock_wallet_modal2"}
                id={modalId}
                closeable={false}
                ref="modal"
                overlay={true}
                overlayClose={false}
                modalHeader="header.unlock_short"
                onCancel={this.handleModalClose}
                leftHeader
                footer={footer}
                zIndex={11000} // always on top
                className="cwd-modal login-modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="74" height="80" viewBox="0 0 74 80" fill="none">
                    <path d="M37.0147 24.6815C38.427 24.6815 39.5723 25.8151 39.5723 27.2133C39.5723 28.6114 38.427 29.7452 37.0147 29.7452C35.6022 29.7452 34.4571 28.6114 34.4571 27.2133C34.4571 25.8151 35.6022 24.6815 37.0147 24.6815Z" fill="#DEC27F"/>
                    <path d="M21.0109 39.1376L26.358 29.2667C26.358 29.2667 30.6402 32.806 36.997 32.806C43.9156 32.806 48.1803 29.1423 49.5612 27.8063L36.9676 4.87131L29.4499 18.4565C28.1338 18.8843 26.8589 19.7147 25.417 20.7978L36.9676 0L53.0086 29.1714L48.9149 31.6469L53.042 39.0717L21.0109 39.1376Z" fill="#DEC27F"/>
                    <path d="M21.9578 27.2347L12.7586 43.871H61.2414L54.258 31.3009L52.164 32.5182L57.0886 41.5414H16.8229L23.8141 28.8234C27.0259 22.9935 33.0446 21.7839 36.8026 21.7839C41.6192 21.7839 44.2634 23.25 44.2634 23.25L36.9834 9.92549L31.3809 20.1387C31.3809 20.1387 25.0497 21.7275 21.9578 27.2347Z" fill="#DEC27F"/>
                    <path d="M18.1224 71.9878C17.6029 76.4624 13.7272 80 9.04868 80C4.01658 80 0 75.9705 0 70.9793C0 65.9896 4.01658 61.9355 9.0268 61.9355C12.311 61.9355 15.2167 63.622 16.8003 66.1758L13.9415 68.1912C12.6662 66.317 10.8699 65.4032 9.05027 65.4032C6.09601 65.4032 3.75691 67.8871 3.75691 70.9793C3.75691 74.0483 6.09601 76.509 9.05027 76.509C11.6962 76.509 13.918 74.6115 14.4141 71.9878H18.1224Z" fill="#DEC27F"/>
                    <path d="M46.0551 61.9355H49.8368L40.9341 80L37.1058 72.6839L33.5124 80L24.1632 61.9355H28.3447L33.6539 72.3493L35.2982 69.1317L31.5865 61.9355H35.7678L41.0772 72.3493L46.0551 61.9355Z" fill="#DEC27F"/>
                    <path d="M64.6383 61.9355C69.7999 61.9355 74 65.8146 74 70.9556C74 76.145 69.7985 80 64.6621 80H57.3878V61.9355H64.6383ZM64.6621 76.6042C67.7588 76.6042 70.1832 74.2038 70.1832 70.9542C70.1832 67.6803 67.7588 65.3282 64.6383 65.3282H61.1091V76.6026H64.6621V76.6042Z" fill="#DEC27F"/>
                </svg>
                <Form className="full-width" layout="vertical">
                    <div id="unlockInputsWrap">
                        {verificationWord == "" || !verificationWord ? (
                            <div className="auth-modal__non-verify">
                                <Translate
                                    className="auth-modal__warning-text"
                                    content="verification_word.warning_text"
                                />

                                <Translate
                                    className="auth-modal__verify-text"
                                    content="verification_word.none_verification"
                                />

                                <a
                                    className="auth-modal__cwd-link"
                                    href={apiUrl}
                                >
                                    {hostName}
                                </a>

                                <a href={apiUrl + "/settings/general"}>
                                    <Translate
                                        className="auth-modal__verify-link"
                                        content="verification_word.none_verification_link"
                                    />
                                </a>
                            </div>
                        ) : (
                            <div className="auth-modal__verify-wrap">
                                <Translate
                                    className="auth-modal__verify-text"
                                    content="verification_word.current_verification"
                                />
                                <span className="auth-modal__verify-word">
                                    {verificationWord}
                                </span>
                            </div>
                        )}

                        <AccountSelector
                            label="account.name"
                            inputRef={this.account_input}
                            accountName={accountName}
                            account={accountName}
                            onChange={this.handleAccountNameChange}
                            onAccountChanged={() => {}}
                            size={60}
                            hideImage
                            placeholder={counterpart.translate(
                                "login.login_placeholder"
                            )}
                            useHR
                            labelClass="login-label"
                            reserveErrorSpace
                        />

                        <Form.Item
                            validateStatus={passwordError ? "error" : ""}
                            help={passwordError || ""}
                        >
                            <Input
                                type="password"
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                                onPressEnter={this.handleLogin}
                                ref={input => {
                                    this.password_input = input;
                                }}
                                placeholder={counterpart.translate(
                                    "login.password_placeholder"
                                )}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        );
    }
}

WalletUnlockModal.defaultProps = {
    modalId: "unlock_wallet_modal2"
};

WalletUnlockModal = withRouter(WalletUnlockModal);

class WalletUnlockModalContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[
                    WalletUnlockStore,
                    AccountStore,
                    WalletManagerStore,
                    WalletDb,
                    BackupStore,
                    SettingsStore
                ]}
                inject={{
                    currentWallet: () =>
                        WalletManagerStore.getState().current_wallet,
                    walletNames: () =>
                        WalletManagerStore.getState().wallet_names,
                    dbWallet: () => WalletDb.getWallet(),
                    isLocked: () => WalletDb.isLocked(),
                    backup: () => BackupStore.getState(),
                    resolve: () => WalletUnlockStore.getState().resolve,
                    reject: () => WalletUnlockStore.getState().reject,
                    locked: () => WalletUnlockStore.getState().locked,
                    passwordLogin: () =>
                        WalletUnlockStore.getState().passwordLogin,
                    passwordAccount: () =>
                        AccountStore.getState().passwordAccount || "",
                    walletLockTimeout: () => {
                        return SettingsStore.getState().settings.get(
                            "walletLockTimeout"
                        );
                    }
                }}
            >
                <WalletUnlockModal {...this.props} />
            </AltContainer>
        );
    }
}
export default WalletUnlockModalContainer;
