import React from "react";
import PrivateKeyStore from "stores/PrivateKeyStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import counterpart from "counterpart";
import NewIcon from "../NewIcon/NewIcon";
import {connect} from "alt-react";
import WalletUnlockStore from "stores/WalletUnlockStore";
import utils from "common/utils";
import ReactTooltip from "react-tooltip";
import {Tooltip} from "crowdwiz-ui-modal";
import sanitize from "sanitize";

class MemoImg extends React.Component {
    static defaultProps = {
        fullLength: false
    };

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps.memo, this.props.memo) ||
            nextProps.wallet_locked !== this.props.wallet_locked
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
            .catch(() => {});
    }

    render() {
        let {memo, fullLength} = this.props;
        if (!memo) {
            return null;
        }

        let {text, isMine} = PrivateKeyStore.decodeMemo(memo);

        if (!text && isMine) {
            return (
                <div className="memo">
                    <span>
                        {counterpart.translate("transfer.memo_unlock")}{" "}
                    </span>
                    <a onClick={this._toggleLock.bind(this)}>
                        <NewIcon
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"locked"}
                        />
                    </a>
                </div>
            );
        }

        text = sanitize(text, {
            whiteList: [], // empty, means filter out all tags
            stripIgnoreTag: true // filter out all HTML not in the whilelist
        });

        let full_memo = text;
        if (text && !fullLength && text.length > 240) {
            text = text.substr(0, 240) + "...";
        }

        if (text) {
            return (
                <a href={text} target="_blank" rel="noopener noreferrer">
                    <img src={text} alt="" className="memo-img" />
                </a>
            );
        } else {
            return null;
        }
    }
}

class MemoImgStoreWrapper extends React.Component {
    render() {
        return <MemoImg {...this.props} />;
    }
}

export default connect(MemoImgStoreWrapper, {
    listenTo() {
        return [WalletUnlockStore];
    },
    getProps() {
        return {
            wallet_locked: WalletUnlockStore.getState().locked
        };
    }
});
