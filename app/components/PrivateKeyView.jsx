import React, {Component} from "react";
import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletDb from "stores/WalletDb";
import Translate from "react-translate-component";
import PrivateKeyStore from "stores/PrivateKeyStore";
import QrcodeModal from "./Modal/QrcodeModal";
import counterpart from "counterpart";
import PropTypes from "prop-types";
import NewIcon from "./NewIcon/NewIcon";
import {Modal, Button} from "crowdwiz-ui-modal";

export default class PrivateKeyView extends Component {
    static propTypes = {
        pubkey: PropTypes.string.isRequired
    };

    constructor() {
        super();
        this.state = this._getInitialState();

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);

        this.showQrModal = this.showQrModal.bind(this);
        this.hideQrModal = this.hideQrModal.bind(this);

        this.onClose = this.onClose.bind(this);
    }

    _getInitialState() {
        return {
            isModalVisible: false,
            isQrModalVisible: false,
            wif: null
        };
    }

    reset() {
        this.setState(this._getInitialState());
    }

    hideModal() {
        this.setState({
            isModalVisible: false
        });

        // document.body.lastElementChild.remove();
    }

    showModal() {
        this.setState({
            isModalVisible: true
        });
    }

    hideQrModal() {
        this.setState({
            isQrModalVisible: false
        });
    }

    showQrModal() {
        this.setState({
            isQrModalVisible: true
        });
    }

    _copyToBuffer(value) {
        var copyText = value;
        var temp = document.createElement("textarea");

        temp.value = copyText;
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);

        temp.select();
        document.execCommand("copy", false, copyText);
        document.body.removeChild(temp);
    }

    render() {
        var modalId = "key_view_modal" + this.props.pubkey;
        var keys = PrivateKeyStore.getState().keys;

        var has_private = keys.has(this.props.pubkey);
        if (!has_private) return <span>{this.props.children}</span>;
        var key = keys.get(this.props.pubkey);

        const footer = [
            <Button key="cancel" onClick={this.onClose}>
                {counterpart.translate("transfer.close")}
            </Button>
        ];

        return (
            <span>
                <a onClick={this.onOpen.bind(this)}>
                    <NewIcon
                        iconClass="permissions__icon-key"
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"key"}
                    />
                    {this.props.children}
                </a>
                <Modal
                    className="cwd-key-modal"
                    visible={this.state.isModalVisible}
                    title={counterpart.translate("account.perm.key_viewer")}
                    ref={modalId}
                    id={modalId}
                    onCancel={this.onClose}
                    footer={footer}
                >
                    <div className="grid-block vertical">
                        <div className="content-block">
                            <div className="permissions__key-wrap">
                                <label>
                                    <Translate content="account.perm.public" />
                                </label>

                                <span
                                    className="permissions__key-field"
                                    id="pub"
                                >
                                    <span>{this.props.pubkey}</span>
                                </span>

                                <div
                                    className="permissions__copy-btn right"
                                    onClick={this._copyToBuffer.bind(
                                        this,
                                        this.props.pubkey
                                    )}
                                    id="circle1"
                                >
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"public-key"}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid-block grid-content">
                                <label>
                                    <Translate content="account.perm.private" />
                                </label>
                                <div style={{width: "100%"}}>
                                    {this.state.wif ? (
                                        <span>
                                            <div className="permissions__key-wrap">
                                                <span
                                                    className="permissions__key-field"
                                                    id="priv"
                                                >
                                                    <span>
                                                        {this.state.wif}
                                                    </span>
                                                </span>
                                                <div
                                                    className="permissions__copy-btn right"
                                                    onClick={this._copyToBuffer.bind(
                                                        this,
                                                        this.state.wif
                                                    )}
                                                    id="circle2"
                                                >
                                                    <NewIcon
                                                        iconWidth={16}
                                                        iconHeight={16}
                                                        iconName={"public-key"}
                                                    />
                                                </div>
                                            </div>
                                            <div className="button-group">
                                                <div
                                                    onClick={this.onHide.bind(
                                                        this
                                                    )}
                                                    className="permissions__copy-btn"
                                                >
                                                    <Translate content="settings.hide" />
                                                </div>

                                                <div
                                                    onClick={this.showQrModal}
                                                    className="permissions__qr-btn"
                                                >
                                                    <NewIcon
                                                        iconWidth={16}
                                                        iconHeight={16}
                                                        iconName={"gener-qr"}
                                                    />
                                                    <Translate content="modal.qrcode.generation_qr" />
                                                </div>
                                            </div>
                                        </span>
                                    ) : (
                                        <span>
                                            <div
                                                id="hideButton"
                                                onClick={this.onShow.bind(this)}
                                            >
                                                <Translate content="account.perm.show" />
                                            </div>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <br />

                            <div>
                                <div>
                                    <label>
                                        <Translate content="account.perm.brain" />
                                    </label>
                                    {key.brainkey_sequence == null
                                        ? "Non-deterministic"
                                        : key.brainkey_sequence}
                                </div>

                                {key.import_account_names &&
                                key.import_account_names.length ? (
                                    <div>
                                        <label>
                                            <Translate content="account.perm.from" />
                                        </label>
                                        {key.import_account_names.join(", ")}
                                        <br />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Modal>
                <QrcodeModal
                    showModal={this.showQrModal}
                    hideModal={this.hideQrModal}
                    visible={this.state.isQrModalVisible}
                    keyValue={this.state.wif}
                />
            </span>
        );
    }

    onOpen() {
        this.showModal();
    }

    onClose() {
        this.reset();
        this.hideModal();
    }

    onShow() {
        WalletUnlockActions.unlock()
            .then(() => {
                var private_key = WalletDb.getPrivateKey(this.props.pubkey);
                this.setState({wif: private_key.toWif()});
            })
            .catch(() => {});
    }

    onHide() {
        this.setState({wif: null});
    }
}
