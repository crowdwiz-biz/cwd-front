import React from "react";
import PrivateKeyStore from "stores/PrivateKeyStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import NewIcon from "../NewIcon/NewIcon";
import { connect } from "alt-react";
import WalletUnlockStore from "stores/WalletUnlockStore";
import utils from "common/utils";
import ReactTooltip from "react-tooltip";
import Translate from "react-translate-component";
import sanitize from "sanitize";
import { Collapse } from "react-bootstrap";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

class MemoText extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: true
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextProps.memo, this.props.memo) ||
            nextProps.wallet_locked !== this.props.wallet_locked ||
            this.state.open !== nextState.open
        );
    }

    componentDidMount() {
        ReactTooltip.rebuild();
    }

    _toggleLock(e) {
        e.preventDefault();
        WalletUnlockActions.unlock()
            .then(() => {
                ReactTooltip.rebuild();
            })
            .catch(() => { });
    }

    setCollapseOpen(open) {
        this.setState({
            open: open
        });
    }

    render() {
        let { memo, wallet_locked } = this.props;

        let { text, isMine } = PrivateKeyStore.decodeMemo(memo);

        if (wallet_locked && isMine) {
            return (
                <div className="operation__memo operation__memo--locked" onClick={this._toggleLock.bind(this)}>
                    <Translate content="transfer.memo_unlock" />

                    <NewIcon
                        iconWidth={16}
                        iconHeight={21}
                        iconName={"lock_btn"}
                    />
                </div>
            );
        }

        text = sanitize(text, {
            whiteList: [], // empty, means filter out all tags
            stripIgnoreTag: true // filter out all HTML not in the whilelist
        });
        let replaced = text.replace(
            /http+[a-zA-Z0-9.:/]+ipfs/g,
            apiUrl + "/ipfs"
        );
        text = replaced;

        let isTextCollapsed = false;

        if (text && text.length > 200) {
            isTextCollapsed = true
        }
        let deviceWidth = window.innerWidth;

        if (text) {
            return (
                <div>
                    <Collapse in={!this.state.open}>
                        <div className={deviceWidth <= 576 && isTextCollapsed ?
                            "operation__memo cwd-common__desc-block cwd-common__desc-block--short-view" : "operation__memo"}>
                            {text}
                        </div>
                    </Collapse>

                    {deviceWidth <= 576 && isTextCollapsed ?
                        <button
                            onClick={this.setCollapseOpen.bind(
                                this,
                                !this.state.open
                            )}
                            className="cwd-btn__show-more-btn noselect"
                        >
                            {this.state.open ? (
                                <Translate content="account.transactions.show_details" />
                            ) : (
                                <Translate content="account.transactions.hide_details" />
                            )}

                            <NewIcon
                                iconClass={this.state.open ? "" : "hide-arrow"}
                                iconWidth={15}
                                iconHeight={8}
                                iconName={"show_more_arrow"}
                            />
                        </button>
                        : null
                    }
                </div>
            )
        } else {
            return null;
        }
    }
}

class MemoTextStoreWrapper extends React.Component {
    render() {
        return <MemoText {...this.props} />;
    }
}

export default connect(MemoTextStoreWrapper, {
    listenTo() {
        return [WalletUnlockStore];
    },
    getProps() {
        return {
            wallet_locked: WalletUnlockStore.getState().locked
        };
    }
});
